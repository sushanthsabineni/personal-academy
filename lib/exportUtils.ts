// Export Utilities for Course Storyboard
// Heavy libraries are dynamically imported to reduce initial bundle size

// NOTE: Keep this type loose; real slide rows come from DB with many optional fields.
// We tolerate any shape and derive strings safely during export.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Slide = any

interface Lesson {
  id: number
  title: string
  description: string
  slides: Slide[]
}

interface Module {
  id: number
  title: string
  description: string
  lessons: Lesson[]
}

/**
 * Export storyboard to PDF format
 * Dynamically imports jsPDF to reduce initial bundle size
 */
export async function exportToPDF(modules: Module[], courseTitle?: string, opts?: { columns?: Record<string, boolean> }) {
  // Dynamic import - only load when needed
  const jsPDF = (await import('jspdf')).default
  
  const doc = new jsPDF()
  let yPos = 20
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const lineHeight = 7

  // Helper to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // Title
  doc.setFontSize(24)
  doc.setTextColor(20, 184, 166)
  doc.setFont('helvetica', 'bold')
  doc.text(courseTitle || 'Course Storyboard', margin, yPos)
  yPos += 15

  // Iterate through modules
  modules.forEach((module, mIdx) => {
    checkPageBreak(30)
    
    // Module Header
    doc.setFontSize(18)
    doc.setTextColor(55, 65, 81)
    doc.setFont('helvetica', 'bold')
    doc.text(`Module ${mIdx + 1}: ${module.title}`, margin, yPos)
    yPos += lineHeight

    doc.setFontSize(11)
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'normal')
    const moduleDesc = doc.splitTextToSize(module.description, 170)
    doc.text(moduleDesc, margin, yPos)
    yPos += moduleDesc.length * 5 + 8

    // Lessons
    module.lessons.forEach((lesson, lIdx) => {
      checkPageBreak(25)
      
      doc.setFontSize(14)
      doc.setTextColor(20, 184, 166)
      doc.setFont('helvetica', 'bold')
      doc.text(`Lesson ${lIdx + 1}: ${lesson.title}`, margin + 5, yPos)
      yPos += lineHeight

      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.setFont('helvetica', 'italic')
      const lessonDesc = doc.splitTextToSize(lesson.description, 165)
      doc.text(lessonDesc, margin + 5, yPos)
      yPos += lessonDesc.length * 4 + 6

      // Slides
      lesson.slides.forEach((slide) => {
        checkPageBreak(40)
        
        doc.setFontSize(12)
        doc.setTextColor(55, 65, 81)
        doc.setFont('helvetica', 'bold')
        const slideNum = (slide.slide_number ?? slide.slideNumber ?? '')
        const slideTitle = (slide.title ?? '')
        doc.text(`Slide ${slideNum}: ${slideTitle}`, margin + 10, yPos)
        yPos += 6

        doc.setFontSize(9)
        doc.setTextColor(75, 85, 99)
        doc.setFont('helvetica', 'normal')
        const learningObjective = (slide.learning_objective ?? slide.learningObjective ?? '')
        if (learningObjective) {
          doc.text(`Learning Objective:`, margin + 10, yPos)
          yPos += 4
          const objText = doc.splitTextToSize(learningObjective, 160)
          doc.text(objText, margin + 12, yPos)
          yPos += objText.length * 4 + 3
        }

        if (!opts?.columns || opts.columns.on_screen_text !== false) {
          const content = (slide.on_screen_text ?? slide.content ?? '')
          if (content) {
            doc.text(`Content:`, margin + 10, yPos)
            yPos += 4
            const contentText = doc.splitTextToSize(content, 160)
            doc.text(contentText, margin + 12, yPos)
            yPos += contentText.length * 4 + 3
          }
        }

        if (!opts?.columns || opts.columns.visual_description !== false) {
          const visual = (slide.visual_description ?? '')
          if (visual) {
            doc.text(`Visual Description:`, margin + 10, yPos)
            yPos += 4
            const vText = doc.splitTextToSize(visual, 160)
            doc.text(vText, margin + 12, yPos)
            yPos += vText.length * 4 + 3
          }
        }

        if (!opts?.columns || opts.columns.media_assets !== false) {
          const media = (slide.mediaNotes ?? slide.media_notes ?? '')
          if (media) {
            doc.text(`Media Notes:`, margin + 10, yPos)
            yPos += 4
            const mediaText = doc.splitTextToSize(media, 160)
            doc.text(mediaText, margin + 12, yPos)
            yPos += mediaText.length * 4 + 3
          }
        }

        if (!opts?.columns || opts.columns.interaction_details !== false) {
          const interaction = (slide.interaction_details ?? slide.interactionType ?? '')
          const assess = (slide.assessment_mapping ? 'Mapped' : (slide.assessmentType ?? ''))
          if (interaction || assess) {
            doc.setTextColor(107, 114, 128)
            doc.text(`Interaction: ${interaction}${assess ? ` | Assessment: ${assess}` : ''}`, margin + 10, yPos)
            yPos += 8
          }
        }

        if (!opts?.columns || opts.columns.developer_notes !== false) {
          const dev = (slide.developer_notes ?? slide.aiNotes ?? '')
          if (dev) {
            doc.text(`Developer Notes:`, margin + 10, yPos)
            yPos += 4
            const dText = doc.splitTextToSize(dev, 160)
            doc.text(dText, margin + 12, yPos)
            yPos += dText.length * 4 + 3
          }
        }

        if (!opts?.columns || opts.columns.accessibility_notes !== false) {
          const acc = (slide.accessibility_notes ?? '')
          if (acc) {
            doc.text(`Accessibility Notes:`, margin + 10, yPos)
            yPos += 4
            const aText = doc.splitTextToSize(acc, 160)
            doc.text(aText, margin + 12, yPos)
            yPos += aText.length * 4 + 3
          }
        }

        if (!opts?.columns || opts.columns.navigation_notes !== false) {
          const nav = (slide.navigation_notes ?? '')
          if (nav) {
            doc.text(`Navigation/UX Notes:`, margin + 10, yPos)
            yPos += 4
            const nText = doc.splitTextToSize(nav, 160)
            doc.text(nText, margin + 12, yPos)
            yPos += nText.length * 4 + 3
          }
        }
      })
      yPos += 3
    })
    yPos += 5
  })

  doc.save('Course-Storyboard.pdf')
}

/**
 * Export storyboard to PowerPoint format
 * Dynamically imports pptxgenjs to reduce initial bundle size
 */
export async function exportToPPT(modules: Module[], courseTitle?: string, opts?: { columns?: Record<string, boolean> }) {
  // Dynamic import - only load when needed
  const PptxGenJS = (await import('pptxgenjs')).default
  
  const pptx = new PptxGenJS()
  
  pptx.author = 'Personal Academy'
  pptx.company = 'Personal Academy'
  pptx.title = courseTitle || 'Course Storyboard'
  pptx.subject = 'Course Development'

  // Title Slide
  const titleSlide = pptx.addSlide()
  titleSlide.background = { color: '14B8A6' }
  titleSlide.addText(courseTitle || 'Course Storyboard', {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 44,
    color: 'FFFFFF',
    bold: true,
    align: 'center'
  })
  titleSlide.addText('Generated by Personal Academy', {
    x: 0.5,
    y: 4.0,
    w: 9,
    h: 0.5,
    fontSize: 16,
    color: 'FFFFFF',
    align: 'center'
  })

  // Module and Lesson Slides
  modules.forEach((module, mIdx) => {
    // Module Overview Slide
    const moduleSlide = pptx.addSlide()
    moduleSlide.background = { color: 'F3F4F6' }
    moduleSlide.addText(`Module ${mIdx + 1}`, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      color: '14B8A6',
      bold: true
    })
    moduleSlide.addText(module.title, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 0.8,
      fontSize: 28,
      color: '374151',
      bold: true
    })
    moduleSlide.addText(module.description, {
      x: 0.5,
      y: 2.2,
      w: 9,
      h: 3,
      fontSize: 16,
      color: '6B7280',
      valign: 'top'
    })

    // Lesson Slides
    module.lessons.forEach((lesson, lIdx) => {
      const lessonSlide = pptx.addSlide()
      lessonSlide.background = { color: 'FFFFFF' }
      lessonSlide.addText(`Lesson ${lIdx + 1}: ${lesson.title}`, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        color: '14B8A6',
        bold: true
      })
      lessonSlide.addText(lesson.description, {
        x: 0.5,
        y: 1.4,
        w: 9,
        h: 1.0,
        fontSize: 14,
        color: '6B7280',
        italic: true
      })

      // Slide Details
      let slideY = 2.6
      lesson.slides.forEach((slide) => {
        if (slideY > 6.5) {
          // Create new slide if content is too long
          const newSlide = pptx.addSlide()
          newSlide.background = { color: 'FFFFFF' }
          newSlide.addText(`Lesson ${lIdx + 1}: ${lesson.title} (continued)`, {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.6,
            fontSize: 20,
            color: '14B8A6',
            bold: true
          })
          slideY = 1.2
        }

        const slideNum = (slide.slide_number ?? slide.slideNumber ?? '')
        const slideTitle = (slide.title ?? '')
        lessonSlide.addText(`Slide ${slideNum}: ${slideTitle}`, {
          x: 0.5,
          y: slideY,
          w: 9,
          h: 0.4,
          fontSize: 14,
          color: '374151',
          bold: true
        })
        slideY += 0.5

        const learningObjective = (slide.learning_objective ?? slide.learningObjective ?? '')
        if (learningObjective) {
          lessonSlide.addText(`Learning Objective: ${learningObjective}`, {
            x: 0.7,
            y: slideY,
            w: 8.5,
            h: 0.6,
            fontSize: 11,
            color: '4B5563'
          })
          slideY += 0.8
        }

        if (!opts?.columns || opts.columns.on_screen_text !== false) {
          const content = (slide.on_screen_text ?? slide.content ?? '')
          if (content) {
            lessonSlide.addText(`${content.substring(0, 180)}`, {
              x: 0.7,
              y: slideY,
              w: 8.5,
              h: 0.6,
              fontSize: 11,
              color: '4B5563'
            })
            slideY += 0.8
          }
        }

        if (!opts?.columns || opts.columns.visual_description !== false) {
          const visual = (slide.visual_description ?? '')
          if (visual) {
            lessonSlide.addText(`Visual: ${visual.substring(0, 180)}`, {
              x: 0.7,
              y: slideY,
              w: 8.5,
              h: 0.6,
              fontSize: 11,
              color: '4B5563'
            })
            slideY += 0.8
          }
        }

        if (!opts?.columns || opts.columns.media_assets !== false) {
          const media = (slide.mediaNotes ?? slide.media_notes ?? '')
          if (media) {
            lessonSlide.addText(`Media: ${media.substring(0, 180)}`, {
              x: 0.7,
              y: slideY,
              w: 8.5,
              h: 0.6,
              fontSize: 11,
              color: '4B5563'
            })
            slideY += 0.8
          }
        }

        if (!opts?.columns || opts.columns.interaction_details !== false) {
          const interaction = (slide.interaction_details ?? slide.interactionType ?? '')
          const assess = (slide.assessment_mapping ? 'Mapped' : (slide.assessmentType ?? ''))
          if (interaction || assess) {
            lessonSlide.addText(`Interaction: ${interaction}${assess ? ` | Assessment: ${assess}` : ''}`, {
              x: 0.7,
              y: slideY,
              w: 8.5,
              h: 0.6,
              fontSize: 11,
              color: '6B7280'
            })
            slideY += 0.8
          }
        }

        if (!opts?.columns || opts.columns.developer_notes !== false) {
          const dev = (slide.developer_notes ?? slide.aiNotes ?? '')
          if (dev) {
            lessonSlide.addText(`Dev: ${dev.substring(0, 180)}`, {
              x: 0.7,
              y: slideY,
              w: 8.5,
              h: 0.6,
              fontSize: 11,
              color: '4B5563'
            })
            slideY += 0.8
          }
        }

        if (!opts?.columns || opts.columns.accessibility_notes !== false) {
          const acc = (slide.accessibility_notes ?? '')
          if (acc) {
            lessonSlide.addText(`A11y: ${acc.substring(0, 180)}`, {
              x: 0.7,
              y: slideY,
              w: 8.5,
              h: 0.6,
              fontSize: 11,
              color: '4B5563'
            })
            slideY += 0.8
          }
        }

        if (!opts?.columns || opts.columns.navigation_notes !== false) {
          const nav = (slide.navigation_notes ?? '')
          if (nav) {
            lessonSlide.addText(`Nav/UX: ${nav.substring(0, 180)}`, {
              x: 0.7,
              y: slideY,
              w: 8.5,
              h: 0.6,
              fontSize: 11,
              color: '4B5563'
            })
            slideY += 0.8
          }
        }
      })
    })
  })

  pptx.writeFile({ fileName: 'Course-Storyboard.pptx' })
}

/**
 * Export storyboard to Word document format
 * Dynamically imports docx and file-saver to reduce initial bundle size
 */
export async function exportToWord(modules: Module[], courseTitle?: string, opts?: { columns?: Record<string, boolean> }) {
  // Dynamic imports - only load when needed
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
  const { saveAs } = await import('file-saver')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: any[] = []

  // Title
  sections.push(
    new Paragraph({
      text: courseTitle || 'Course Storyboard',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  )

  // Iterate through modules
  modules.forEach((module, mIdx) => {
    // Module Header
    sections.push(
      new Paragraph({
        text: `Module ${mIdx + 1}: ${module.title}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
        text: module.description,
        spacing: { after: 300 }
      })
    )

    // Lessons
    module.lessons.forEach((lesson, lIdx) => {
      sections.push(
        new Paragraph({
          text: `Lesson ${lIdx + 1}: ${lesson.title}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 }
        }),
        new Paragraph({
          text: lesson.description,
          spacing: { after: 200 }
        })
      )

      // Slides
      lesson.slides.forEach((slide) => {
        const slideNum = (slide.slide_number ?? slide.slideNumber ?? '')
        const slideTitle = (slide.title ?? '')
        const learningObjective = (slide.learning_objective ?? slide.learningObjective ?? '')
        const content = (slide.on_screen_text ?? slide.content ?? '')
        const visual = (slide.visual_description ?? '')
        const media = (slide.mediaNotes ?? slide.media_notes ?? '')
        const interaction = (slide.interaction_details ?? slide.interactionType ?? '')
        const assess = (slide.assessment_mapping ? 'Mapped' : (slide.assessmentType ?? ''))
        const dev = (slide.developer_notes ?? slide.aiNotes ?? '')
        const acc = (slide.accessibility_notes ?? '')
        const nav = (slide.navigation_notes ?? '')

        sections.push(
          new Paragraph({
            text: `Slide ${slideNum}: ${slideTitle}`,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          ...(learningObjective ? [new Paragraph({
            children: [
              new TextRun({ text: 'Learning Objective: ', bold: true }),
              new TextRun({ text: learningObjective })
            ],
            spacing: { after: 100 }
          })] : []),
          ...(opts?.columns && opts.columns.on_screen_text === false || !content ? [] : [
            new Paragraph({
              children: [
                new TextRun({ text: 'Content: ', bold: true }),
                new TextRun({ text: content })
              ],
              spacing: { after: 100 }
            })
          ]),
          ...(opts?.columns && opts.columns.visual_description === false || !visual ? [] : [
            new Paragraph({
              children: [
                new TextRun({ text: 'Visual: ', bold: true }),
                new TextRun({ text: visual })
              ],
              spacing: { after: 100 }
            })
          ]),
          ...(opts?.columns && opts.columns.media_assets === false || !media ? [] : [
            new Paragraph({
              children: [
                new TextRun({ text: 'Media Notes: ', bold: true }),
                new TextRun({ text: media })
              ],
              spacing: { after: 100 }
            })
          ]),
          ...(opts?.columns && opts.columns.interaction_details === false || (!interaction && !assess) ? [] : [
            new Paragraph({
              children: [
                new TextRun({ text: 'Interaction Type: ', bold: true }),
                new TextRun({ text: interaction || '—' }),
                new TextRun({ text: ' | ' }),
                new TextRun({ text: 'Assessment: ', bold: true }),
                new TextRun({ text: assess || '—' })
              ],
              spacing: { after: 200 }
            })
          ]),
          ...(opts?.columns && opts.columns.developer_notes === false || !dev ? [] : [
            new Paragraph({
              children: [
                new TextRun({ text: 'Developer Notes: ', bold: true }),
                new TextRun({ text: dev })
              ],
              spacing: { after: 100 }
            })
          ]),
          ...(opts?.columns && opts.columns.accessibility_notes === false || !acc ? [] : [
            new Paragraph({
              children: [
                new TextRun({ text: 'Accessibility Notes: ', bold: true }),
                new TextRun({ text: acc })
              ],
              spacing: { after: 100 }
            })
          ]),
          ...(opts?.columns && opts.columns.navigation_notes === false || !nav ? [] : [
            new Paragraph({
              children: [
                new TextRun({ text: 'Navigation/UX Notes: ', bold: true }),
                new TextRun({ text: nav })
              ],
              spacing: { after: 100 }
            })
          ])
        )
      })
    })
  })

  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, 'Course-Storyboard.docx')
}
