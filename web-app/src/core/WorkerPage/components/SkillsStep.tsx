import React, { useState } from "react";

interface SkillsStepProps {
  formData: {
    skills?: string;
    experience_years?: number;
  };
  errors: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
}

const skillOptions = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Cleaning",
  "Painting",
  "AC Repair",
  "Appliance Repair",
  "Gardening",
  "Cooking",
  "Driving",
  "Delivery",
  "Construction",
  "Welding",
  "Masonry",
  "Roofing",
  "Flooring",
  "Interior Design",
  "Landscaping",
  "Security",
  "Maintenance",
];

const SkillsStep: React.FC<SkillsStepProps> = ({
  formData,
  errors,
  onFieldChange,
}) => {
  const [customSkill, setCustomSkill] = useState("");
  const skills = formData.skills ? JSON.parse(formData.skills) : [];

  const handleSkillToggle = (skill: string) => {
    const newSkills = skills.includes(skill)
      ? skills.filter((s: string) => s !== skill)
      : [...skills, skill];
    onFieldChange("skills", JSON.stringify(newSkills));
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      const trimmedSkill = customSkill.trim();
      const skillExists = skills.some(
        (skill: string) => skill.toLowerCase() === trimmedSkill.toLowerCase()
      );

      if (!skillExists) {
        const newSkills = [...skills, trimmedSkill];
        onFieldChange("skills", JSON.stringify(newSkills));
        setCustomSkill("");
      }
    }
  };

  const handleCustomSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomSkill();
    }
  };

  return (
    <div className="space-y-6 text-black">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Skills & Experience
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Select your skills and provide your work experience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Experience Years */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience *
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.experience_years || 0}
            onChange={(e) => onFieldChange("experience_years", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.experience_years ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter years of experience"
          />
          {errors.experience_years && (
            <p className="text-red-600 text-sm mt-1">
              {errors.experience_years}
            </p>
          )}
        </div>

        {/* Skills Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Skills *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {skillOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  skills.includes(skill)
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {errors.skills && (
            <p className="text-red-600 text-sm mt-2">{errors.skills}</p>
          )}
        </div>

        {/* Custom Skill Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Custom Skill
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={handleCustomSkillKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter custom skill"
            />
            <button
              type="button"
              onClick={handleAddCustomSkill}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Selected Skills Display */}
        {skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Selected Skills ({skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsStep;
