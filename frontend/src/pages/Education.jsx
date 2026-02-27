import React, { useEffect } from 'react';
import useEducation from '../hooks/useEducation';

export default function Education() {
  const { content, loadContent } = useEducation();

  useEffect(() => {
    loadContent();
  }, []);

  return (
    <div className="education-page">
      <h2>Education</h2>
      {content ? (
        <ul>
          {content.modules.map((m, i) => (
            <li key={i}>{m.title || m.topic || 'Untitled module'}</li>
          ))}
        </ul>
      ) : (
        <p>Loading modules…</p>
      )}
    </div>
  );
}
