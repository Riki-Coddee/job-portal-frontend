import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';

const SkillsInput = ({ skills = [], onChange, placeholder = "Add required skills..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleAddSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      const newSkills = [...skills, trimmedSkill];
      onChange(newSkills);
      setInputValue('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    onChange(newSkills);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      // Remove last skill on backspace when input is empty
      handleRemoveSkill(skills[skills.length - 1]);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const skillsArray = pastedText.split(/[,，;；\n]+/).map(s => s.trim()).filter(s => s);
    
    if (skillsArray.length > 1) {
      const newSkills = [...new Set([...skills, ...skillsArray])];
      onChange(newSkills);
    } else {
      setInputValue(pastedText);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      handleAddSkill(inputValue);
    }
    setIsTyping(false);
  };

  // Common programming/tech skills for suggestions
  const suggestedSkills = [
    'React', 'JavaScript', 'Python', 'Django', 'Node.js', 
    'HTML', 'CSS', 'TypeScript', 'AWS', 'Docker', 
    'Git', 'REST API', 'GraphQL', 'MongoDB', 'PostgreSQL',
    'Redux', 'Vue.js', 'Angular', 'Java', 'C#',
    'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
    'Linux', 'Azure', 'GCP', 'CI/CD', 'Agile',
    'Scrum', 'JIRA', 'Figma', 'UI/UX', 'Testing'
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Required Skills
        <span className="text-xs text-gray-500 ml-2">
          {skills.length} skill{skills.length !== 1 ? 's' : ''} added
        </span>
      </label>

      {/* Skills Input */}
      <div className="relative">
        <div className={`min-h-12 border ${isTyping ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} rounded-lg bg-white p-2 flex flex-wrap gap-2`}>
          {/* Display existing skills */}
          {skills.map((skill, index) => (
            <div
              key={index}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-medium"
            >
              <Tag size={12} className="mr-1.5" />
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          
          {/* Input field */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsTyping(true);
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setIsTyping(true)}
            onBlur={handleBlur}
            placeholder={skills.length === 0 ? placeholder : "Add another skill..."}
            className="flex-1 min-w-[120px] border-none outline-none text-sm bg-transparent"
          />
        </div>

        {/* Add button */}
        {inputValue.trim() && (
          <button
            type="button"
            onClick={() => handleAddSkill(inputValue)}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Quick suggestions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Quick suggestions:</span>
          <button
            type="button"
            onClick={() => setInputValue('')}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear input
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedSkills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => handleAddSkill(skill)}
              disabled={skills.includes(skill)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                skills.includes(skill)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 Press Enter or comma to add skills</p>
        <p>💡 You can paste a comma-separated list of skills</p>
        <p>💡 Add specific skills that are required for this role</p>
      </div>
    </div>
  );
};

export default SkillsInput;