import { useState } from 'react';
import { fetchEducationContent } from '../api/educationApi';

export default function useEducation() {
  const [content, setContent] = useState(null);
  const loadContent = async () => {
    const data = await fetchEducationContent();
    setContent(data);
  };
  return { content, loadContent };
}
