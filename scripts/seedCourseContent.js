require("dotenv").config();
const db = require("../src/config/db");
const { v4: uuidv4 } = require("uuid");

const lessons = [
  {
    id: "intro",
    title: "Introduction to HTML",
    type: "lesson",
    icon: "📄",
    content: [
      {
        topic: "Lessons Overview",
        content: "In this lesson, you will learn the fundamentals of Frontend Development, focusing on HTML (structure) and JavaScript (interactivity). By the end you will understand how websites are built and how users interact with them.",
        img: [],
      },
      {
        topic: "HTML Structure",
        content: "Every web page starts with HTML. HTML uses elements (tags) to define different types of content like headings, paragraphs, links, and images. These elements are nested into each other to create a document structure that browsers can understand and render.",
        img: [],
      },
      {
        topic: "Interactivity With JavaScript",
        content: "JavaScript brings your pages to life by adding interactivity. It allows you to respond to user actions, update content dynamically, and communicate with servers without reloading the page.",
        img: [],
      }
    ],
    tips: "Using semantic HTML tags like header, nav, article, and footer instead of generic div tags improves accessibility, SEO, and code maintainability.",
    best_practice: "Keep your HTML, CSS, and JavaScript separate and focused on their individual responsibilities. HTML handles structure, CSS handles presentation, JavaScript handles behavior.",
    conclusion: "As you practice these fundamental concepts, you'll develop the skills needed to build increasingly complex interactive web applications."
  },
  {
    id: "internet",
    title: "How the Internet Works",
    type: "lesson",
    icon: "🌐",
    content: [
      {
        topic: "What is the Internet?",
        content: "The internet is a global network of computers that communicate with each other. It allows users to access websites, send messages, and share information across the world.",
        img: [],
      },
      {
        topic: "How Websites are Accessed",
        content: "When you type a URL into your browser, a request is sent to a server. The server responds by sending back HTML, CSS, and JavaScript files which the browser renders into a webpage.",
        img: [],
      },
      {
        topic: "HTTP & HTTPS",
        content: "HTTP is the protocol used to transfer data between the browser and server. HTTPS is the secure version that encrypts data to protect users.",
        img: [],
      }
    ],
    tips: "Think of the browser as a client and the server as the provider.",
    best_practice: "Always optimize your files to reduce load time, and always use HTTPS for secure communication.",
    conclusion: "As you practice these fundamental concepts, you'll develop the skills needed to build increasingly complex interactive web applications."
  },
  {
    id: "devtools",
    title: "DevTools Basics",
    type: "lesson",
    icon: "🛠️",
    content: [
      {
        topic: "Introduction to DevTools",
        content: "DevTools are built-in tools in browsers that help developers inspect, debug, and test web applications in real time.",
        img: [],
      },
      {
        topic: "Inspecting Elements",
        content: "You can inspect HTML elements to see their structure, styles, and layout. This helps you understand how a webpage is built.",
        img: [],
      },
      {
        topic: "Console & Debugging",
        content: "The console allows you to run JavaScript code and view errors. It is essential for debugging your applications.",
        img: [],
      }
    ],
    tips: "Right-click any element and click Inspect. Use console.log() to track values.",
    best_practice: "Use this tool to debug layout and styling issues. Always fix console errors before deploying.",
    conclusion: "As you practice these fundamental concepts, you'll develop the skills needed to build increasingly complex interactive web applications."
  },
  {
    id: "assignment",
    title: "Assignment",
    type: "assignment",
    icon: "📝",
    content: [
      {
        topic: "Assignment: Build Your First Interactive Page",
        content: "Create a simple webpage with proper HTML structure that includes a heading, paragraph, button, and div for displaying messages. Write the JavaScript code that changes the message text and colour when the button is clicked.",
        img: [],
      },
      {
        topic: "Submission Guide",
        content: "Ensure your code is properly structured and readable. Submit your project using the provided submission link.",
        img: [],
      }
    ],
    tips: "Test your page in the browser before submitting.",
    best_practice: "Write clean and well-indented code.",
    conclusion: null
  }
];

async function seedCourseContent() {
  try {
    // Step 1 — Create a course first
    console.log("Creating course...");

    // Check if course already exists
    const existingCourse = await db.query(
      "SELECT id FROM courses WHERE title = $1",
      ["Frontend Development Fundamentals"]
    );

    let courseId;

    if (existingCourse.rows.length > 0) {
      courseId = existingCourse.rows[0].id;
      console.log("✅ Course already exists:", courseId);
    } else {
      // Get any instructor or admin to be the course owner
      const instructor = await db.query(
        "SELECT id FROM users WHERE role IN ('instructor', 'admin') LIMIT 1"
      );

      if (instructor.rows.length === 0) {
        console.log("❌ No instructor or admin found!");
        console.log("Please run: npm run create-admin first");
        process.exit(1);
      }

      const courseResult = await db.query(
        `INSERT INTO courses 
          (title, description, instructor_id, is_published)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          "Frontend Development Fundamentals",
          "Learn the fundamentals of Frontend Development including HTML, JavaScript and DevTools.",
          instructor.rows[0].id,
          true
        ]
      );

      courseId = courseResult.rows[0].id;
      console.log("✅ Course created:", courseId);
    }

    // Step 2 — Insert lessons
    console.log("Inserting lessons...");

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];

      // Check if lesson already exists
      const existingLesson = await db.query(
        "SELECT id FROM lessons WHERE title = $1 AND course_id = $2",
        [lesson.title, courseId]
      );

      if (existingLesson.rows.length > 0) {
        console.log(`⚠️  Lesson already exists: ${lesson.title}`);
        continue;
      }

      await db.query(
        `INSERT INTO lessons 
          (course_id, title, rich_content, tips, best_practice, conclusion, icon, order_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          courseId,
          lesson.title,
          JSON.stringify(lesson.content),
          lesson.tips,
          lesson.best_practice,
          lesson.conclusion,
          lesson.icon,
          i + 1
        ]
      );

      console.log(`✅ Lesson inserted: ${lesson.title}`);
    }

    console.log("🎉 Course content seeded successfully!");
    console.log(`Course ID: ${courseId}`);
    console.log("Frontend can now call:");
    console.log(`GET /api/courses/${courseId}/lessons`);
    process.exit(0);

  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seedCourseContent();