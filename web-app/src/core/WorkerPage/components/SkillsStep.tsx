"use client";

import React, { useState } from "react";
import { TextField, Box, Typography, Chip, Button, Grid } from "@mui/material";
import { Add } from "@mui/icons-material";

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
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      const newSkills = [...skills, customSkill.trim()];
      onFieldChange("skills", JSON.stringify(newSkills));
      setCustomSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const newSkills = skills.filter((s: string) => s !== skillToRemove);
    onFieldChange("skills", JSON.stringify(newSkills));
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 600, color: "#1a1a1a", mt: 0 }}
      >
        Skills & Experience
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#666" }}>
        Tell us about your skills and work experience.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Years of Experience"
          required
          type="number"
          value={formData.experience_years || ""}
          onChange={(e) => onFieldChange("experience_years", e.target.value)}
          placeholder="Enter years of experience"
          error={!!errors.experience_years}
          helperText={errors.experience_years}
          fullWidth
        />

        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Select Your Skills
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {skillOptions.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onClick={() => handleSkillToggle(skill)}
                color={skills.includes(skill) ? "primary" : "default"}
                variant={skills.includes(skill) ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Add Custom Skill
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="Custom Skill"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder="Enter a custom skill"
              fullWidth
            />
            <Button
              variant="outlined"
              onClick={handleAddCustomSkill}
              startIcon={<Add />}
              disabled={!customSkill.trim()}
            >
              Add
            </Button>
          </Box>
        </Box>

        {skills.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
              Selected Skills
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {skills.map((skill: string) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  color="primary"
                  variant="filled"
                />
              ))}
            </Box>
          </Box>
        )}

        {errors.skills && (
          <Typography color="error" variant="body2">
            {errors.skills}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SkillsStep;