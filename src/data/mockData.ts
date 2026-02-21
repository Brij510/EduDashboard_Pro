import { Category, Video, ContentItem } from "@/types/dashboard";

export const categories: Category[] = [
  { id: "class-9th", name: "Class-9th", icon: "GraduationCap", children: [] },
  { id: "class-10th", name: "Class-10th", icon: "GraduationCap", children: [] },
  {
    id: "lecture",
    name: "Lecture",
    icon: "Video",
    children: [
      { id: "lecture-physics", name: "Physics", icon: "Atom", parentId: "lecture" },
      { id: "lecture-chemistry", name: "Chemistry", icon: "FlaskConical", parentId: "lecture" },
      { id: "lecture-mathematics", name: "Mathematics", icon: "Calculator", parentId: "lecture" },
      { id: "lecture-biology", name: "Biology", icon: "Leaf", parentId: "lecture" },
    ],
  },
  {
    id: "textbook",
    name: "Text Book",
    icon: "BookOpen",
    children: [
      { id: "textbook-physics", name: "Physics", icon: "Atom", parentId: "textbook" },
      { id: "textbook-chemistry", name: "Chemistry", icon: "FlaskConical", parentId: "textbook" },
      { id: "textbook-mathematics", name: "Mathematics", icon: "Calculator", parentId: "textbook" },
      { id: "textbook-biology", name: "Biology", icon: "Leaf", parentId: "textbook" },
    ],
  },
  {
    id: "notes",
    name: "Notes",
    icon: "FileText",
    children: [
      { id: "notes-physics", name: "Physics", icon: "Atom", parentId: "notes" },
      { id: "notes-chemistry", name: "Chemistry", icon: "FlaskConical", parentId: "notes" },
      { id: "notes-mathematics", name: "Mathematics", icon: "Calculator", parentId: "notes" },
      { id: "notes-biology", name: "Biology", icon: "Leaf", parentId: "notes" },
    ],
  },
  {
    id: "lecture-pdf",
    name: "Lecture Pdf",
    icon: "FileDown",
    children: [
      { id: "pdf-physics", name: "Physics", icon: "Atom", parentId: "lecture-pdf" },
      { id: "pdf-chemistry", name: "Chemistry", icon: "FlaskConical", parentId: "lecture-pdf" },
      { id: "pdf-mathematics", name: "Mathematics", icon: "Calculator", parentId: "lecture-pdf" },
      { id: "pdf-biology", name: "Biology", icon: "Leaf", parentId: "lecture-pdf" },
    ],
  },
];

export const videos: Video[] = [
  {
    id: "1",
    title: "Physics Lecture: Laws of Motion",
    description: "Learn about Newton's laws of motion and their applications.",
    thumbnail: "https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
    duration: "45:32",
    categoryId: "lecture-physics",
    watched: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Chemistry Lecture: Organic Chemistry Basics",
    description: "Introduction to organic chemistry concepts and reactions.",
    thumbnail: "https://img.youtube.com/vi/TNhaISOUy6Q/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=TNhaISOUy6Q",
    duration: "52:18",
    categoryId: "lecture-chemistry",
    watched: false,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    title: "Mathematics Lecture: Calculus Fundamentals",
    description: "Complete introduction to differential calculus.",
    thumbnail: "https://img.youtube.com/vi/kqtD5dpn9C8/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
    duration: "1:02:45",
    categoryId: "lecture-mathematics",
    watched: false,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    title: "Biology Lecture: Cell Structure",
    description: "Understanding the structure and function of cells.",
    thumbnail: "https://img.youtube.com/vi/YiLUYf4HDh4/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=YiLUYf4HDh4",
    duration: "38:45",
    categoryId: "lecture-biology",
    watched: true,
    createdAt: "2024-02-10",
  },
];

// Initial folder structure for content management
export const initialContents: ContentItem[] = [
  {
    id: "folder-class-9th",
    name: "Class-9th",
    type: "folder",
    parentId: null,
    createdAt: "2024-01-01",
  },
  {
    id: "folder-class-10th",
    name: "Class-10th",
    type: "folder",
    parentId: null,
    createdAt: "2024-01-01",
  },
  // Root level folders for each category
  {
    id: "folder-lecture",
    name: "Lecture",
    type: "folder",
    parentId: null,
    createdAt: "2024-01-01",
  },
  {
    id: "folder-textbook",
    name: "Text Book",
    type: "folder",
    parentId: null,
    createdAt: "2024-01-01",
  },
  {
    id: "folder-notes",
    name: "Notes",
    type: "folder",
    parentId: null,
    createdAt: "2024-01-01",
  },
  {
    id: "folder-lecturepdf",
    name: "Lecture Pdf",
    type: "folder",
    parentId: null,
    createdAt: "2024-01-01",
  },
  // Subject folders inside Lecture
  {
    id: "folder-lecture-physics",
    name: "Physics",
    type: "folder",
    parentId: "folder-lecture",
    createdAt: "2024-01-01",
  },
  {
    id: "folder-lecture-chemistry",
    name: "Chemistry",
    type: "folder",
    parentId: "folder-lecture",
    createdAt: "2024-01-01",
  },
  {
    id: "folder-lecture-mathematics",
    name: "Mathematics",
    type: "folder",
    parentId: "folder-lecture",
    createdAt: "2024-01-01",
  },
  // Sample video inside Physics lecture
  {
    id: "video-sample-1",
    name: "Introduction to Classical Mechanics",
    type: "video",
    parentId: "folder-lecture-physics",
    createdAt: "2024-01-15",
    videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
    duration: "45:30",
    description: "Fundamental concepts of motion, forces, and energy",
  },
  // Subject folders inside Text Book
  {
    id: "folder-textbook-physics",
    name: "Physics",
    type: "folder",
    parentId: "folder-textbook",
    createdAt: "2024-01-01",
  },
  {
    id: "folder-textbook-chemistry",
    name: "Chemistry",
    type: "folder",
    parentId: "folder-textbook",
    createdAt: "2024-01-01",
  },
  // Sample PDF inside Physics textbook
  {
    id: "pdf-sample-1",
    name: "Physics Class 12 NCERT",
    type: "pdf",
    parentId: "folder-textbook-physics",
    createdAt: "2024-01-10",
    pdfUrl: "https://drive.google.com/file/d/example/view",
  },
];