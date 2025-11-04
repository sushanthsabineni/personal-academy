import { createClient } from '@supabase/supabase-js';

type ModuleRow = {
  id: string;
  title: string;
  order_index: number;
  created_at: string;
};

type LessonRow = {
  id: string;
  title: string;
  order_index: number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase admin credentials are required for test helpers.');
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function fetchLatestCourseIdForUser(email: string): Promise<string | null> {
  const userId = await fetchUserIdByEmail(email);
  if (!userId) {
    return null;
  }

  const { data, error } = await adminClient
    .from('courses')
    .select('id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return data && data.length > 0 ? data[0].id : null;
}

export async function fetchModulesForCourse(courseId: string): Promise<ModuleRow[]> {
  const { data, error } = await adminClient
    .from('modules')
    .select('id, title, order_index, created_at')
    .eq('course_id', courseId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function fetchUserIdByEmail(targetEmail: string): Promise<string | null> {
  const normalized = targetEmail.toLowerCase();
  const perPage = 100;
  let page = 1;

  while (page < 50) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const match = data.users.find((user) => (user.email ?? '').toLowerCase() === normalized);
    if (match) {
      return match.id;
    }

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return null;
}

export async function insertLessonForModule(
  courseId: string,
  moduleId: string,
  title: string,
  orderIndex: number,
): Promise<LessonRow> {
  const { data, error } = await adminClient
    .from('lessons')
    .insert([
      {
        module_id: moduleId,
        course_id: courseId,
        title,
        description: '',
        order_index: orderIndex,
        ai_generated: false,
      },
    ])
    .select('id, title, order_index')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchLessonsForModule(moduleId: string): Promise<LessonRow[]> {
  const { data, error } = await adminClient
    .from('lessons')
    .select('id, title, order_index')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function deleteLessonById(lessonId: string): Promise<void> {
  const { error } = await adminClient.from('lessons').delete().eq('id', lessonId);
  if (error) {
    throw error;
  }
}
