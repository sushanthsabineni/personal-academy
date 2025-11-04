'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCourseSidebar } from '@/components/layout/CreateCourseSidebar'
import { StepNavigation } from '@/components/layout/StepNavigation'
import { BookOpen, Clock, Edit3, Sparkles, Check, ChevronRight, ChevronDown, Target, TrendingUp, Layers, Plus, Trash2, Lock } from '@/lib/icons'
import { supabase, checkAuth } from '@/lib/supabase/client'
import { calculateApproximateDuration, calculateApproximateDurationWithDefaults, calculateModuleDurations } from '@/lib/utils/durationCalculator'

type Lesson = {
  id?: string;
  title: string;
  description: string;
  duration: string;
};

type Module = {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: Lesson[];
  approved: boolean;
};

export default function CourseStep3() {
  const router = useRouter()
  const [courseId, setCourseId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [modules, setModules] = useState<Module[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [editingModule, setEditingModule] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lessonIdx: number } | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<{ type: 'module' | 'lesson'; moduleId: string; lessonIdx?: number } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [hasGeneratedStructure, setHasGeneratedStructure] = useState(false)
  const [enhancingId, setEnhancingId] = useState<string | null>(null) // Track which module/lesson is being enhanced
  const [enhancementError, setEnhancementError] = useState<string | null>(null)

  // Move loadModulesFromDb to the top of the file
  async function loadModulesFromDb(courseId: string) {
    const { data: dbModules, error } = await supabase
      .from('modules')
      .select('id, title, description, order_index, is_approved')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    if (error) {
      console.error('Error loading modules:', error);
      setModules([]);
      return;
    }
    // Fetch lessons for all modules in a separate query
    const moduleIds = (dbModules || []).map((mod: { id: string }) => mod.id);
    const lessonsByModule: Record<string, { id: string; module_id: string; title: string; description: string; order_index: number }[]> = {};
    if (moduleIds.length > 0) {
      const { data: dbLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, module_id, title, description, order_index')
        .in('module_id', moduleIds);
      if (lessonsError) {
        console.error('Error loading lessons:', lessonsError);
      } else {
        for (const lesson of (dbLessons as any[]) || []) {
          if (!lessonsByModule[(lesson as any).module_id]) lessonsByModule[(lesson as any).module_id] = [];
          lessonsByModule[(lesson as any).module_id].push(lesson as any);
        }
      }
    }
    const mappedModules: Module[] = (dbModules || []).map((mod: { id: string; title: string; description: string; order_index: number; is_approved: boolean }) => ({
      id: mod.id,
      title: mod.title,
      description: mod.description ?? '',
      duration: '0 min',
      approved: Boolean(mod.is_approved),
      lessons: (lessonsByModule[mod.id] || []).sort((a, b) => a.order_index - b.order_index).map((lesson: { id: string; title: string; description: string; order_index: number }, idx: number) => ({
        id: lesson.id,
        title: lesson.title ?? `Lesson ${idx + 1}`,
        description: lesson.description ?? '',
        duration: '5 min',
      })),
    }));
    setModules(mappedModules);
    // Expand all modules by default
    if (mappedModules.length > 0) {
      setExpandedModules(new Set(mappedModules.map(m => m.id)))
      // If modules exist from DB, mark as generated so user can add more
      setHasGeneratedStructure(true)
    }
  }

  // Calculate and apply approximate durations based on Step 1 and Step 2 data
  async function calculateAndApplyDurations(courseId: string, modulesData: Module[]) {
    try {
      // Fetch course data including Step 1 and Step 2 selections
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('duration, course_type, audio_narration, image_generation, video_content, animation_motion, knowledge_assessments')
        .eq('id', courseId)
        .single()

      if (courseError || !courseData) {
        console.warn('Could not fetch course data for duration calculation:', courseError)
        return
      }

      // Extract data from course
      const baseDuration = ((courseData as any).duration || 30)
      const courseType = (((courseData as any).course_type || 'interactive') as 'simple' | 'interactive' | 'highly_interactive' | 'scenario_driven')
      const quizStrategy = (((courseData as any).knowledge_assessments || 'ai_decide') as 'every_module' | 'end_of_course' | 'pre_post' | 'ai_decide')
      const numberOfModules = modulesData.length || 1

      // Calculate per-module durations with realistic variation
      const durationResult = calculateModuleDurations({
        baseDuration,
        courseType,
        quizStrategy,
        audioNarration: Boolean((courseData as any).audio_narration),
        imageGeneration: Boolean((courseData as any).image_generation),
        videoContent: Boolean((courseData as any).video_content),
        knowledgeAssessments: Boolean((courseData as any).knowledge_assessments),
        animationMotion: Boolean((courseData as any).animation_motion),
        numberOfModules,
      })

      // Apply individual durations to each module
      const updatedModules = modulesData.map((mod, index) => ({
        ...mod,
        duration: `Approx ${durationResult.moduleDurations[index]} min`,
      }))

      setModules(updatedModules)
    } catch (error) {
      console.error('Error calculating durations:', error)
    }
  }

  // Generate course structure using AI - memoized to prevent unnecessary re-renders
  const generateCourseStructure = useCallback(async (isRegenerate = false) => {
    if (!courseId) {
      setGenerationError('Course ID not found')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch('/api/course/generate-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, isRegenerate }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate course structure')
      }

      const data = await response.json()

      if (!data.success || !data.structure) {
        throw new Error('Invalid response from AI')
      }

      // Clear existing modules and lessons
      const existingModuleIds = modules.map(m => m.id)
      if (existingModuleIds.length > 0) {
        await supabase.from('lessons').delete().in('module_id', existingModuleIds)
        await supabase.from('modules').delete().in('id', existingModuleIds)
      }

      // Create new modules and lessons from AI-generated structure
      const newModules: Module[] = []

      for (let modIdx = 0; modIdx < data.structure.modules.length; modIdx++) {
        const aiModule = data.structure.modules[modIdx]

        // Insert module
        const { data: insertedModule, error: moduleError } = await supabase
          .from('modules')
          .insert({
            course_id: courseId,
            title: aiModule.title,
            description: aiModule.description,
            order_index: modIdx,
            is_approved: false,
            ai_generated: true,
          } as any)
          .select('id')
          .single()

        if (moduleError || !insertedModule) {
          console.error('Error creating module:', moduleError)
          continue
        }

        const moduleId = (insertedModule as any).id
        const newLessons: Lesson[] = []

        // Insert lessons for this module
        if (aiModule.lessons && Array.isArray(aiModule.lessons)) {
          for (let lessonIdx = 0; lessonIdx < aiModule.lessons.length; lessonIdx++) {
            const aiLesson = aiModule.lessons[lessonIdx]

            const { data: insertedLesson, error: lessonError } = await supabase
              .from('lessons')
              .insert({
                module_id: moduleId,
                course_id: courseId,
                title: aiLesson.title,
                description: aiLesson.description,
                order_index: lessonIdx,
                duration: 5,
                ai_generated: true,
              } as any)
              .select('id')
              .single()

            if (!lessonError && insertedLesson) {
              newLessons.push({
                id: (insertedLesson as any).id,
                title: aiLesson.title,
                description: aiLesson.description,
                duration: '5 min',
              })
            }
          }
        }

        newModules.push({
          id: moduleId,
          title: aiModule.title,
          description: aiModule.description,
          duration: '0 min',
          lessons: newLessons,
          approved: false,
        })
      }

      setModules(newModules)
      // Expand all modules by default
      if (newModules.length > 0) {
        setExpandedModules(new Set(newModules.map(m => m.id)))
      }
      setHasGeneratedStructure(true)
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Error generating course structure:', error)
      setGenerationError(
        error instanceof Error ? error.message : 'Failed to generate course structure'
      )
    } finally {
      setIsGenerating(false)
    }
  }, [courseId, modules])

  useEffect(() => {
    async function loadCourseAndModules() {
      const user = await checkAuth();
      if (!user) {
        router.push('/dashboard');
        return;
      }
      // Find latest draft or in-progress course for user
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['draft', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
      const course = courses && courses.length > 0 ? courses[0] : null;
      if (!course) {
        router.push('/create/essentials');
        return;
      }
      setCourseId((course as any).id);
      await loadModulesFromDb((course as any).id);
      // Calculate and apply durations based on Step 1 and Step 2 data
      // Note: We'll call this after modules are loaded
      setIsInitialized(true);
    }
    loadCourseAndModules();
  }, [router]);

  // Auto-generate course structure on first load if no modules exist
  useEffect(() => {
    if (!isInitialized || !courseId) return;
    
    // Only auto-generate if no modules exist and we haven't generated yet
    if (modules.length === 0 && !hasGeneratedStructure) {
      generateCourseStructure(false);
    }
  }, [isInitialized, courseId, modules.length, hasGeneratedStructure, generateCourseStructure]);

  // Calculate and apply approximate durations based on Step 1 and Step 2 data
  // Track if we've calculated durations to prevent repeated calculations
  const durationCalculatedRef = useRef(false)

  // Calculate durations once when modules are first loaded from database
  useEffect(() => {
    if (!isInitialized || !courseId || modules.length === 0) return;
    if (durationCalculatedRef.current) return;
    
    // Check if modules already have calculated durations (start with "Approx")
    const hasCalculatedDurations = modules.some(m => m.duration.startsWith('Approx'));
    if (hasCalculatedDurations) {
      durationCalculatedRef.current = true;
      return;
    }
    
    calculateAndApplyDurations(courseId, modules);
    durationCalculatedRef.current = true;
    // Only run when modules array length changes (new modules loaded or added)
    // The ref prevents re-runs when module content changes
  }, [isInitialized, courseId, modules]);

  // Auto-save changes to DB with debounce
  useEffect(() => {
    if (!isInitialized || !courseId) return
    const saveTimeout = setTimeout(async () => {
      const modulePayloads = modules
        .filter((mod) => mod.id && mod.id.length === 36)
        .map((mod, orderIdx) => ({
          id: mod.id,
          course_id: courseId,
          title: mod.title,
          description: mod.description,
          order_index: orderIdx,
          is_approved: !!mod.approved,
          ai_generated: false,
        }))

      const lessonPayloads = modules.flatMap((mod) => {
        if (!mod.id || mod.id.length !== 36) return []
        return mod.lessons
          .filter((lesson) => lesson.id && lesson.id.length === 36)
          .map((lesson, lessonIdx) => ({
            id: lesson.id,
            module_id: mod.id,
            course_id: courseId,
            title: lesson.title,
            description: lesson.description,
            order_index: lessonIdx,
            duration: Number.parseInt(lesson.duration, 10) || 5,
            ai_generated: false,
          }))
      })

      try {
        if (modulePayloads.length > 0) {
          const { error: moduleError } = await supabase
            .from('modules')
            .upsert(modulePayloads as any, { onConflict: 'id' })
          if (moduleError) throw moduleError
        }

        if (lessonPayloads.length > 0) {
          const { error: lessonError } = await supabase
            .from('lessons')
            .upsert(lessonPayloads as any, { onConflict: 'id' })
          if (lessonError) throw lessonError
        }

        setHasUnsavedChanges(false)
      } catch (error) {
        console.error('Error saving modules or lessons:', error)
      }
    }, 2000)

    return () => clearTimeout(saveTimeout)
  }, [modules, courseId, isInitialized])

  const toggleApproval = (id: string) => {
    setModules(modules.map(m => 
      m.id === id ? { ...m, approved: !m.approved } : m
    ))
    setHasUnsavedChanges(true)
  }

  const approveAll = () => {
    setModules(modules.map(m => ({ ...m, approved: true })))
    setHasUnsavedChanges(true)
  }

  const handleModuleEdit = (moduleId: string, field: 'title' | 'description', value: string) => {
    // Prevent editing if module is approved
    const targetModule = modules.find(m => m.id === moduleId)
    if (targetModule?.approved) return

    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, [field]: value } : m
    ))
    setHasUnsavedChanges(true)
  }

  const handleLessonEdit = (moduleId: string, lessonIdx: number, field: 'title' | 'description', value: string) => {
    // Prevent editing if module is approved
    const targetModule = modules.find(m => m.id === moduleId)
    if (targetModule?.approved) return

    setModules(modules.map(m => {
      if (m.id === moduleId) {
        const updatedLessons = [...m.lessons]
        updatedLessons[lessonIdx] = { ...updatedLessons[lessonIdx], [field]: value }
        return { ...m, lessons: updatedLessons }
      }
      return m
    }))
    setHasUnsavedChanges(true)
  }

  // Explicit save function for modules and lessons
  const saveModulesAndLessons = async () => {
    if (!courseId) return

    setHasUnsavedChanges(true) // Show saving state

    const modulePayloads = modules
      .filter((mod) => mod.id && mod.id.length === 36)
      .map((mod, orderIdx) => ({
        id: mod.id,
        course_id: courseId,
        title: mod.title,
        description: mod.description,
        order_index: orderIdx,
        is_approved: !!mod.approved,
        ai_generated: false,
      }))

    const lessonPayloads = modules.flatMap((mod) => {
      if (!mod.id || mod.id.length !== 36) return []
      return mod.lessons
        .filter((lesson) => lesson.id && lesson.id.length === 36)
        .map((lesson, lessonIdx) => ({
          id: lesson.id,
          module_id: mod.id,
          course_id: courseId,
          title: lesson.title,
          description: lesson.description,
          order_index: lessonIdx,
          duration: Number.parseInt(lesson.duration, 10) || 5,
          ai_generated: false,
        }))
    })

    try {
      if (modulePayloads.length > 0) {
        const { error: moduleError } = await supabase
          .from('modules')
          .upsert(modulePayloads as any, { onConflict: 'id' })
        if (moduleError) throw moduleError
      }

      if (lessonPayloads.length > 0) {
        const { error: lessonError } = await supabase
          .from('lessons')
          .upsert(lessonPayloads as any, { onConflict: 'id' })
        if (lessonError) throw lessonError
      }

      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving modules or lessons:', error)
    }
  }

  const handleAddModule = async () => {
    if (!courseId) return;
    // Insert new module into DB
    const { data: insertedModule, error } = await supabase
      .from('modules')
      .insert({
        course_id: courseId,
        title: `New Module ${modules.length + 1}`,
        description: 'Describe what learners will achieve after completing this module.',
        order_index: modules.length,
        is_approved: false,
        ai_generated: false,
      } as any)
      .select('id')
      .single();

    if (error || !insertedModule) {
      console.error('Error inserting module:', {
        error: error || 'Unknown error',
        payload: {
          course_id: courseId,
          title: `New Module ${modules.length + 1}`,
          description: 'Describe what learners will achieve after completing this module.',
          order_index: modules.length,
          is_approved: false,
          ai_generated: false,
        },
      });
      return;
    }

    // Insert first lesson for this module
    const { error: lessonError } = await supabase
      .from('lessons')
      .insert({
        module_id: (insertedModule as any).id,
        course_id: courseId,
        title: 'Lesson 1',
        description: 'Outline the key topic or activity covered in this lesson.',
        order_index: 0,
        duration: 5,
        ai_generated: false,
      } as any);

    if (lessonError) {
      console.error('Error inserting lesson:', {
        error: lessonError || 'Unknown error',
        payload: {
          module_id: (insertedModule as any).id,
          course_id: courseId,
          title: 'Lesson 1',
          description: 'Outline the key topic or activity covered in this lesson.',
          order_index: 0,
          duration: 5,
          ai_generated: false,
        },
      });
    }

    // Reload modules/lessons from DB
    await loadModulesFromDb(courseId);
    // Expand the newly added module
    setExpandedModules(prev => new Set([...prev, (insertedModule as any).id]));
    setEditingModule((insertedModule as any).id);
    setEditingLesson({ moduleId: (insertedModule as any).id, lessonIdx: 0 });
    setHasUnsavedChanges(true);
  };

  const deleteModule = (moduleId: string) => {
    // Delete from DB, then update local state
    (async () => {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);
      if (error) {
        console.error('Error deleting module:', error);
      } else {
        await loadModulesFromDb(courseId!);
        // Remove from expanded modules if it was expanded
        setExpandedModules(prev => {
          const updated = new Set(prev);
          updated.delete(moduleId);
          return updated;
        });
        if (editingModule === moduleId) setEditingModule(null);
        setEditingLesson(prev => {
          if (!prev || prev.moduleId !== moduleId) return prev;
          return null;
        });
        setHasUnsavedChanges(true);
      }
    })();
  };

  const deleteLesson = (moduleId: string, lessonIdx: number) => {
    setModules(prev => prev.map(mod => {
      if (mod.id !== moduleId) return mod;
      const updatedLessons = mod.lessons.filter((_, idx) => idx !== lessonIdx);
      return { ...mod, lessons: updatedLessons };
    }));
    setEditingLesson(prev => {
      if (!prev || prev.moduleId !== moduleId) return prev;
      if (prev.lessonIdx === lessonIdx) return null;
      if (prev.lessonIdx > lessonIdx) {
        return { moduleId, lessonIdx: prev.lessonIdx - 1 };
      }
      return prev;
    });
    setHasUnsavedChanges(true);
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!courseId) return;
    const targetModule = modules.find(m => m.id === moduleId);
    
    // Prevent adding lessons to approved modules
    if (targetModule?.approved) return;

    const nextLessonIndex = targetModule ? targetModule.lessons.length : 0;

    // Insert new lesson into DB
    const { error } = await supabase
      .from('lessons')
      .insert({
        module_id: moduleId,
        course_id: courseId,
        title: `Lesson ${nextLessonIndex + 1}`,
        description: 'Outline the key takeaway or activity for this lesson.',
        order_index: nextLessonIndex,
        duration: 5,
        ai_generated: false,
      } as never);

    if (error) {
      console.error('Error inserting lesson:', {
        error,
        payload: {
          module_id: moduleId,
          course_id: courseId,
          title: `Lesson ${nextLessonIndex + 1}`,
          description: 'Outline the key takeaway or activity for this lesson.',
          order_index: nextLessonIndex,
          duration: 5,
          ai_generated: false,
        },
      });
      return;
    }

    // Reload modules/lessons from DB
    await loadModulesFromDb(courseId);
    // Ensure module is expanded when adding a lesson
    setExpandedModules(prev => new Set([...prev, moduleId]));
    setEditingLesson({ moduleId, lessonIdx: nextLessonIndex });
    setHasUnsavedChanges(true);
  };

  const requestLessonDeletion = (moduleId: string, lessonIdx: number) => {
    // Prevent deleting lessons from approved modules
    const targetModule = modules.find(m => m.id === moduleId)
    if (targetModule?.approved) return

    setPendingDeletion({ type: 'lesson', moduleId, lessonIdx });
  };

  const cancelDeletion = () => {
    setPendingDeletion(null)
  }

  // Updated delete logic to skip confirmation modal if dontAskAgain is true
  const handleDelete = (type: 'module' | 'lesson', moduleId: string, lessonIdx?: number) => {
    // Always show confirmation modal
    setPendingDeletion({ type, moduleId, lessonIdx });
  };

  const confirmDeletion = () => {
    if (!pendingDeletion) return;

    if (pendingDeletion.type === 'module') {
      deleteModule(pendingDeletion.moduleId);
    } else if (pendingDeletion.type === 'lesson' && pendingDeletion.lessonIdx != null) {
      deleteLesson(pendingDeletion.moduleId, pendingDeletion.lessonIdx);
    }

    setPendingDeletion(null);
  }

  const handleEnhanceWithAI = async (moduleId: string) => {
    if (!courseId) return

    const targetModule = modules.find(m => m.id === moduleId)
    if (!targetModule) return

    setEnhancingId(moduleId)
    setEnhancementError(null)

    try {
      const response = await fetch('/api/course/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          type: 'module',
          moduleId,
          currentTitle: targetModule.title,
          currentDescription: targetModule.description,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to enhance module')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Enhancement failed')
      }

      // Update the module with enhanced description
      const updatedModules = modules.map(m =>
        m.id === moduleId
          ? { ...m, description: data.enhancement.description || data.enhancement }
          : m
      )
      setModules(updatedModules)
      setHasUnsavedChanges(true)

      // Auto-save the enhancement
      await saveModulesAndLessons()
    } catch (error) {
      console.error('Error enhancing module:', error)
      setEnhancementError(error instanceof Error ? error.message : 'Failed to enhance module')
    } finally {
      setEnhancingId(null)
    }
  }

  const handleLessonAIEnhance = async (moduleId: string, lessonIdx: number) => {
    if (!courseId) return

    const targetModule = modules.find(m => m.id === moduleId)
    if (!targetModule || !targetModule.lessons[lessonIdx]) return

    const enhanceId = `${moduleId}-${lessonIdx}`
    setEnhancingId(enhanceId)
    setEnhancementError(null)

    const lesson = targetModule.lessons[lessonIdx]

    try {
      const response = await fetch('/api/course/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          type: 'lesson',
          moduleId,
          lessonIndex: lessonIdx,
          currentTitle: lesson.title,
          currentDescription: lesson.description,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to enhance lesson')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Enhancement failed')
      }

      // Update the lesson with enhanced content
      const updatedModules = modules.map(m => {
        if (m.id === moduleId) {
          const updatedLessons = [...m.lessons]
          updatedLessons[lessonIdx] = {
            ...updatedLessons[lessonIdx],
            title: data.enhancement.title || lesson.title,
            description: data.enhancement.description || lesson.description,
          }
          return { ...m, lessons: updatedLessons }
        }
        return m
      })
      setModules(updatedModules)
      setHasUnsavedChanges(true)

      // Auto-save the enhancement
      await saveModulesAndLessons()
    } catch (error) {
      console.error('Error enhancing lesson:', error)
      setEnhancementError(error instanceof Error ? error.message : 'Failed to enhance lesson')
    } finally {
      setEnhancingId(null)
    }
  }

  const approvedCount = modules.filter(m => m.approved).length;
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  // Calculate approximate slides: avg 3-4 slides per lesson + 1-2 intro/outro slides per module
  const approxSlides = Math.max(0, totalLessons * 3 + modules.length * 1);
  const totalDuration = modules.reduce((sum, m) => {
    // Extract number from formats like "5 min" or "Approx 5 min"
    const match = m.duration.match(/(\d+)/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);
  const approvalPercent = modules.length ? (approvedCount / modules.length) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-slate-900">
      <CreateCourseSidebar />

      {/* Main Content */}
      <main
        className="flex-1 pb-12 transition-[padding-left] duration-300"
        style={{ paddingLeft: 'var(--create-sidebar-width, 5rem)' }}
      >
        <div className="w-full px-6 py-2 border-b border-light-border dark:border-dark-border">
          <div className="max-w-full mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-light-text dark:text-dark-text mb-1">
                Review Course Structure
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI generated {modules.length} modules with {totalLessons} lessons - Approve and customize as needed
              </p>
              {/* Auto-save indicator */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {hasUnsavedChanges ? 'Saving...' : 'All changes saved'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-3 py-1.5 text-xs font-semibold text-brand-teal border border-brand-teal/30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg hover:bg-brand-teal/10 transition-all flex items-center gap-1.5"
              >
                <BookOpen size={14} />
                Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-8">
          {/* Stats Bar */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Approval Progress */}
            <div className="bg-gradient-to-br from-brand-teal to-brand-cyan rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target size={20} />
                <p className="text-sm font-medium opacity-90">Approved</p>
              </div>
              <p className="text-3xl font-bold">{modules.length ? `${approvedCount}/${modules.length}` : '0/0'}</p>
              <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${approvalPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Total Lessons */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={20} className="text-purple-500" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lessons</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalLessons}</p>
            </div>

            {/* Duration */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-blue-500" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">Approx {totalDuration} min</p>
            </div>

            {/* Modules */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={20} className="text-orange-500" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approx Slides</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{approxSlides}</p>
            </div>
          </div>

          {/* Error Message */}
          {generationError && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Generation Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{generationError}</p>
              </div>
              <button
                onClick={() => setGenerationError(null)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}

          {/* Enhancement Error Message */}
          {enhancementError && (
            <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Enhancement Error</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{enhancementError}</p>
              </div>
              <button
                onClick={() => setEnhancementError(null)}
                className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8 flex flex-wrap gap-3">
            {modules.length === 0 && !hasGeneratedStructure ? (
              <button
                onClick={() => generateCourseStructure(false)}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-teal to-brand-cyan hover:opacity-90 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-brand-teal/30"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Structure
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleAddModule}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all flex items-center gap-2 border border-brand-teal/50"
                >
                  <Plus size={18} />
                  Add Module
                </button>
                <button
                  onClick={approveAll}
                  className="px-5 py-2.5 bg-brand-teal hover:bg-brand-cyan text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-brand-teal/30"
                >
                  <Check size={18} />
                  Approve All Modules
                </button>
                <button
                  onClick={() => generateCourseStructure(true)}
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all flex items-center gap-2 border border-gray-300 dark:border-slate-600"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Regenerate Structure
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Learning Journey Timeline */}
          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={module.id} className="group">
                {/* Module Card */}
                <div className={`
                  relative bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                  ${module.approved 
                    ? 'border-brand-teal shadow-lg shadow-brand-teal/10' 
                    : 'border-gray-200 dark:border-slate-700 hover:border-brand-teal/50 hover:shadow-md'
                  }
                `}>
                  
                  {/* Module Number Badge */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>

                  {/* Module Content */}
                  <div className="p-6 pl-20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Title & Edit */}
                        <div className="flex items-center gap-3 mb-3">
                          {editingModule === module.id ? (
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) => handleModuleEdit(module.id, 'title', e.target.value)}
                              disabled={module.approved}
                              className={`flex-1 px-3 py-2 text-2xl font-bold bg-gray-50 dark:bg-slate-900 border-2 border-brand-teal rounded-lg text-gray-900 dark:text-white focus:outline-none ${
                                module.approved ? 'opacity-60 cursor-not-allowed' : ''
                              }`}
                              autoFocus
                            />
                          ) : (
                            <>
                              <h2 className={`text-2xl font-bold ${
                                module.approved 
                                  ? 'text-gray-500 dark:text-gray-500' 
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {module.title}
                              </h2>
                              <button
                                onClick={() => {
                                  if (module.approved) return
                                  setEditingModule(null)
                                  // Immediately save when user closes edit mode
                                  saveModulesAndLessons()
                                }}
                                disabled={module.approved}
                                title={module.approved ? 'Module is locked. Unapprove to edit.' : 'Edit module'}
                                className={`p-2 transition-all ${
                                  module.approved
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                              >
                                {module.approved ? (
                                  <Lock size={16} className="text-gray-400" />
                                ) : (
                                  <Edit3 size={16} className="text-gray-400" />
                                )}
                              </button>
                            </>
                          )}
                        </div>

                        {/* Description */}
                        {editingModule === module.id ? (
                          <textarea
                            value={module.description}
                            onChange={(e) => handleModuleEdit(module.id, 'description', e.target.value)}
                            disabled={module.approved}
                            rows={2}
                            className={`w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border-2 border-brand-teal rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none mb-3 ${
                              module.approved ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                          />
                        ) : (
                          <p className={`mb-4 leading-relaxed ${
                            module.approved
                              ? 'text-gray-500 dark:text-gray-500'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {module.description}
                          </p>
                        )}

                        {/* Lesson Preview */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1.5">
                            <BookOpen size={16} />
                            <span>{module.lessons.length} lessons</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={16} />
                            <span>{module.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp size={16} />
                            <span>Progressive difficulty</span>
                          </div>
                        </div>

                        {/* Lesson Pills */}
                        {!expandedModules.has(module.id) && (
                          <div className="flex flex-wrap gap-2">
                            {module.lessons.map((lesson, idx) => (
                              <div 
                                key={lesson.id || idx}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-full text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 bg-brand-teal rounded-full"></span>
                                {lesson.title}
                              </div>
                            ))}
                            {module.lessons.length === 0 && (
                              <div className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-full text-xs text-gray-500 dark:text-gray-400">
                                No lessons yet
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expanded Lessons */}
                        {expandedModules.has(module.id) && (
                          <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-slate-700 pt-4">
                            {module.lessons.map((lesson, idx) => (
                              <div 
                                key={idx}
                                className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="flex items-center justify-center w-6 h-6 bg-brand-teal/20 text-brand-teal rounded-full text-xs font-bold">
                                        {idx + 1}
                                      </span>
                                      {editingLesson?.moduleId === module.id && editingLesson?.lessonIdx === idx ? (
                                        <input
                                          type="text"
                                          value={lesson.title}
                                          onChange={(e) => handleLessonEdit(module.id, idx, 'title', e.target.value)}
                                          className="flex-1 px-2 py-1 text-sm font-semibold bg-white dark:bg-slate-800 border-2 border-brand-teal rounded text-gray-900 dark:text-white focus:outline-none"
                                          autoFocus
                                        />
                                      ) : (
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                          {lesson.title}
                                        </h4>
                                      )}
                                    </div>
                                    {editingLesson?.moduleId === module.id && editingLesson?.lessonIdx === idx ? (
                                      <textarea
                                        value={lesson.description}
                                        onChange={(e) => handleLessonEdit(module.id, idx, 'description', e.target.value)}
                                        rows={2}
                                        className="w-full ml-8 px-2 py-1 text-sm bg-white dark:bg-slate-800 border-2 border-brand-teal rounded text-gray-600 dark:text-gray-400 focus:outline-none"
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                                        {lesson.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* Edit/Save Button */}
                                    <button
                                      onClick={() => {
                                        if (module.approved) return
                                        // If currently editing, save immediately
                                        if (editingLesson?.moduleId === module.id && editingLesson?.lessonIdx === idx) {
                                          setEditingLesson(null)
                                          saveModulesAndLessons()
                                        } else {
                                          // Enter edit mode
                                          setEditingLesson({ moduleId: module.id, lessonIdx: idx })
                                        }
                                      }}
                                      disabled={module.approved}
                                      title={module.approved ? 'Module is locked. Unapprove to edit.' : 'Edit lesson'}
                                      className={`px-2 py-1 text-xs rounded transition-all flex items-center gap-1 ${
                                        module.approved
                                          ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                                          : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                                      }`}
                                    >
                                      <Edit3 size={12} />
                                      {editingLesson?.moduleId === module.id && editingLesson?.lessonIdx === idx ? 'Save' : 'Edit'}
                                    </button>
                                    {/* AI Enhance Button */}
                                    <button
                                      onClick={() => handleLessonAIEnhance(module.id, idx)}
                                      disabled={enhancingId === `${module.id}-${idx}` || module.approved}
                                      className={`px-2 py-1 text-xs rounded transition-all flex items-center gap-1 border ${
                                        module.approved
                                          ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-slate-700 cursor-not-allowed opacity-50'
                                          : enhancingId === `${module.id}-${idx}`
                                          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 border-purple-300 cursor-not-allowed'
                                          : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-800'
                                      }`}
                                      title={module.approved ? 'Module is locked. Unapprove to enhance.' : 'Enhance this lesson with AI'}
                                    >
                                      {enhancingId === `${module.id}-${idx}` ? (
                                        <div className="w-3 h-3 border-1.5 border-purple-400 border-t-purple-600 rounded-full animate-spin" />
                                      ) : (
                                        <Sparkles size={12} />
                                      )}
                                      AI
                                    </button>
                                    <button
                                      onClick={() => requestLessonDeletion(module.id, idx)}
                                      disabled={module.approved}
                                      title={module.approved ? 'Module is locked. Unapprove to delete.' : 'Delete lesson'}
                                      className={`px-2 py-1 text-xs rounded transition-all flex items-center gap-1 border ${
                                        module.approved
                                          ? 'bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500 border-red-200 dark:border-red-900 cursor-not-allowed opacity-50'
                                          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
                                      }`}
                                      aria-label="Delete lesson"
                                    >
                                      <Trash2 size={12} />
                                      Delete
                                    </button>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {module.lessons.length === 0 && (
                              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400">
                                This module does not have any lessons yet. Add lessons or reuse content from other modules to build it out.
                              </div>
                            )}
                            <div className="pt-2">
                              <button
                                onClick={() => handleAddLesson(module.id)}
                                disabled={module.approved}
                                title={module.approved ? 'Module is locked. Unapprove to add lessons.' : 'Add lesson'}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-teal border border-brand-teal/40 bg-white dark:bg-slate-900 rounded-lg transition-all ${
                                  module.approved
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-brand-teal/10'
                                }`}
                              >
                                <Plus size={14} />
                                Add Lesson
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        {/* Approve/Unapprove Toggle */}
                        <button
                          onClick={() => toggleApproval(module.id)}
                          title={module.approved ? 'Unapprove to unlock editing' : 'Approve to lock module'}
                          className={`
                            p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2
                            ${module.approved
                              ? 'bg-brand-teal border-brand-teal text-white hover:bg-red-600 hover:border-red-600'
                              : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-400 hover:border-brand-teal hover:text-brand-teal'
                            }
                          `}
                        >
                          <Check size={20} />
                          {module.approved && <span className="text-xs font-semibold">Locked</span>}
                        </button>

                        {/* AI Enhancement */}
                        <button
                          onClick={() => handleEnhanceWithAI(module.id)}
                          disabled={enhancingId === module.id || module.approved}
                          className={`p-3 rounded-lg transition-all border ${
                            module.approved
                              ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-slate-700 cursor-not-allowed'
                              : enhancingId === module.id
                              ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 border-purple-300 cursor-not-allowed'
                              : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-800'
                          }`}
                          title={module.approved ? 'Module is locked. Unapprove to enhance.' : 'Enhance this module with AI'}
                        >
                          {enhancingId === module.id ? (
                            <div className="w-5 h-5 border-2 border-purple-400 border-t-purple-600 rounded-full animate-spin" />
                          ) : (
                            <Sparkles size={20} />
                          )}
                        </button>

                        {/* Delete Module */}
                        <button
                          onClick={() => handleDelete('module', module.id)}
                          disabled={module.approved}
                          title={module.approved ? 'Cannot delete locked module. Unapprove first.' : 'Delete module'}
                          className={`p-3 rounded-lg transition-all border ${
                            module.approved
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500 border-red-200 dark:border-red-800 cursor-not-allowed opacity-50'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border-red-200 dark:border-red-800'
                          }`}
                          aria-label="Delete module"
                        >
                          <Trash2 size={20} />
                        </button>

                        {/* Expand/Collapse */}
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedModules)
                            if (newExpanded.has(module.id)) {
                              newExpanded.delete(module.id)
                            } else {
                              newExpanded.add(module.id)
                            }
                            setExpandedModules(newExpanded)
                          }}
                          className="p-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center"
                        >
                          {expandedModules.has(module.id) ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Save Button (when editing) */}
                    {editingModule === module.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <button
                          onClick={() => setEditingModule(null)}
                          className="px-4 py-2 bg-brand-teal hover:bg-brand-cyan text-white font-medium rounded-lg transition-all"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Connector Line (except last) */}
                  {index < modules.length - 1 && (
                    <div className="absolute left-8 -bottom-4 w-0.5 h-4 bg-gradient-to-b from-brand-teal to-transparent"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-900 dark:text-blue-200 text-center">
              <strong>Pro Tip:</strong> Approve modules you&apos;re satisfied with, or use AI enhancement to automatically improve content quality and engagement
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-8">
            <StepNavigation 
              currentStep={3}
              isValid={approvedCount > 0}
            />
          </div>
        </div>
      </main>

      {pendingDeletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Confirm deletion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {pendingDeletion.type === 'module'
                ? 'Are you sure you want to delete this module? All of its lessons will be removed.'
                : 'Are you sure you want to delete this lesson from the module?'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeletion}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletion}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
