import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as Yup from "yup";

// Suggestion Arrays
const institutions = [
  "Indian Institute of Technology Bombay",
  "Indian Institute of Technology Delhi",
  "University of Delhi",
  "Jawaharlal Nehru University",
  "Banaras Hindu University",
  "Anna University",
  "University of Mumbai",
  "Indian Institute of Technology Madras",
  "Indian Institute of Technology Kanpur",
  "Birla Institute of Technology and Science",
  "National Institute of Technology Trichy",
  "Indian Institute of Technology Kharagpur",
];
const degreeOptions = [
  "Bachelor of Technology",
  "Bachelor of Engineering",
  "Bachelor of Science",
  "Master of Technology",
  "Master of Engineering",
  "Master of Science",
  "MBA",
  "MCA",
];
const positions = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Product Manager",
  "Business Analyst",
];
const companies = [
  "Tata Consultancy Services",
  "Infosys",
  "Wipro",
  "Accenture",
  "IBM",
  "Google",
  "Microsoft",
  "Amazon",
  "Reliance Industries",
  "Mahindra & Mahindra",
];

// Enhanced Resume Templates
const templates = [
  {
    id: 1,
    name: "Classic",
    previewColor: "bg-white",
    textColor: "text-black",
    font: "font-serif",
  },
  {
    id: 2,
    name: "Modern",
    previewColor: "bg-gray-800",
    textColor: "text-white",
    font: "font-sans",
  },
  {
    id: 3,
    name: "Elegant",
    previewColor: "bg-blue-50",
    textColor: "text-blue-900",
    font: "font-mono",
  },
  {
    id: 4,
    name: "Professional",
    previewColor: "bg-gray-50",
    textColor: "text-gray-900",
    font: "font-serif",
  },
  {
    id: 5,
    name: "Contemporary",
    previewColor: "bg-white",
    textColor: "text-gray-800",
    font: "font-sans",
  },
  {
    id: 6,
    name: "Bold Sidebar",
    previewColor: "bg-blue-600",
    textColor: "text-white",
    font: "font-sans",
  },
  {
    id: 7,
    name: "Soft Blocks",
    previewColor: "bg-gray-50",
    textColor: "text-gray-900",
    font: "font-serif",
  },
  {
    id: 8,
    name: "Minimal Dots",
    previewColor: "bg-white",
    textColor: "text-gray-800",
    font: "font-sans",
  },
  {
    id: 9,
    name: "Sleek Modern",
    previewColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
    textColor: "text-white",
    font: "font-sans",
  },
  {
    id: 10,
    name: "Minimalist",
    previewColor: "bg-white",
    textColor: "text-black",
    font: "font-sans",
  },
  {
    id: 11,
    name: "Corporate",
    previewColor: "bg-white",
    textColor: "text-black",
    font: "font-serif",
  },
  {
    id: 12,
    name: "Creative",
    previewColor: "bg-yellow-50",
    textColor: "text-gray-900",
    font: "font-sans",
  },
  {
    id: 13,
    name: "Sidebar Layout",
    previewColor: "bg-gray-100",
    textColor: "text-black",
    font: "font-sans",
  },
  {
    id: 14,
    name: "Two-Column",
    previewColor: "bg-white",
    textColor: "text-black",
    font: "font-sans",
  },
  {
    id: 15,
    name: "Timeline",
    previewColor: "bg-white",
    textColor: "text-black",
    font: "font-serif",
  },
];

// Animation Variants
const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

// Validation Schemas
const personalInfoSchema = Yup.object().shape({
  name: Yup.string().required("Full Name is required"),
  title: Yup.string().required("Professional Title is required"),
  location: Yup.string().required("Location is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone Number is required"),
  about: Yup.string().required("About You is required"),
});

const educationSchema = Yup.object().shape({
  institution: Yup.string().required("Institution is required"),
  degree: Yup.string().required("Degree is required"),
  fieldOfStudy: Yup.string().required("Field of Study is required"),
  startDate: Yup.string().required("Start Date is required"),
  endDate: Yup.string().required("End Date is required"),
});

const experienceSchema = Yup.object().shape({
  position: Yup.string().required("Position is required"),
  company: Yup.string().required("Company is required"),
  startDate: Yup.string().required("Start Date is required"),
  endDate: Yup.string().required("End Date is required"),
});

const skillsSchema = Yup.string().required("Skills are required");

// Main Component
const ResumeBuilderAdvanced = () => {
  const [step, setStep] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    about: "",
  });
  const [educationList, setEducationList] = useState([
    {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      grade: "",
      description: "",
    },
  ]);
  const [experienceList, setExperienceList] = useState([
    { position: "", company: "", startDate: "", endDate: "", description: "" },
  ]);
  const [projects, setProjects] = useState([
    { title: "", description: "", technologies: "", url: "" },
  ]);
  const [skills, setSkills] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const resumePreviewRef = useRef(null);

  const totalSteps = 7;
  const progress = ((step + 1) / totalSteps) * 100;

  const calculateResumeScore = () => {
    let score = 0;
    if (
      personalInfo.name &&
      personalInfo.title &&
      personalInfo.location &&
      personalInfo.email &&
      personalInfo.phone &&
      personalInfo.about
    ) {
      score += 10;
    }
    const educationScore = Math.min(educationList.length * 20, 40);
    score += educationScore;
    const experienceScore = Math.min(experienceList.length * 20, 60);
    score += experienceScore;
    if (skills.trim() !== "") {
      const skillCount = skills
        .split(",")
        .filter((s) => s.trim() !== "").length;
      score += 10 + Math.min(skillCount * 2, 20);
    }
    const projectScore = Math.min(projects.length * 15, 45);
    score += projectScore;
    return score;
  };

  const nextStep = async () => {
    if (step === 0) {
      try {
        await personalInfoSchema.validate(personalInfo, { abortEarly: false });
        setErrors({});
      } catch (err) {
        const newErrors = {};
        err.inner.forEach((error) => (newErrors[error.path] = error.message));
        setErrors(newErrors);
        return;
      }
    } else if (step === 1) {
      try {
        for (const edu of educationList)
          await educationSchema.validate(edu, { abortEarly: false });
        setErrors({});
      } catch (err) {
        const newErrors = {};
        err.inner.forEach((error) => (newErrors[error.path] = error.message));
        setErrors({ education: newErrors });
        return;
      }
    } else if (step === 2) {
      try {
        for (const exp of experienceList)
          await experienceSchema.validate(exp, { abortEarly: false });
        setErrors({});
      } catch (err) {
        const newErrors = {};
        err.inner.forEach((error) => (newErrors[error.path] = error.message));
        setErrors({ experience: newErrors });
        return;
      }
    } else if (step === 4) {
      try {
        await skillsSchema.validate(skills);
        setErrors({});
      } catch (err) {
        setErrors({ skills: err.message });
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);
  const cancelOperation = () => window.history.back();

  const downloadPDF = async () => {
    if (!resumePreviewRef.current) return;
    setIsGenerating(true);
    const canvas = await html2canvas(resumePreviewRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: resumePreviewRef.current.scrollWidth,
      height: resumePreviewRef.current.scrollHeight,
      windowWidth: resumePreviewRef.current.scrollWidth,
      windowHeight: resumePreviewRef.current.scrollHeight,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${personalInfo.name || "resume"}.pdf`);
    setIsGenerating(false);
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addEducation = () =>
    setEducationList([
      ...educationList,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        grade: "",
        description: "",
      },
    ]);
  const updateEducation = (index, field, value) =>
    setEducationList(
      educationList.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    );
  const removeEducation = (index) =>
    setEducationList(educationList.filter((_, i) => i !== index));

  const addExperience = () =>
    setExperienceList([
      ...experienceList,
      {
        position: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  const updateExperience = (index, field, value) =>
    setExperienceList(
      experienceList.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    );
  const removeExperience = (index) =>
    setExperienceList(experienceList.filter((_, i) => i !== index));

  const addProject = () =>
    setProjects([
      ...projects,
      { title: "", description: "", technologies: "", url: "" },
    ]);
  const updateProject = (index, field, value) =>
    setProjects(
      projects.map((proj, i) =>
        i === index ? { ...proj, [field]: value } : proj
      )
    );
  const removeProject = (index) =>
    setProjects(projects.filter((_, i) => i !== index));

  const ResumePreview = () => {
    const skillArray = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const filteredProjects = projects.filter(
      (proj) => proj.title.trim() !== "" || proj.description.trim() !== ""
    );

    switch (selectedTemplate.id) {
      case 1: // Classic Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-white text-black font-serif min-h-[297mm]"
          >
            <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
              <h1 className="text-4xl font-bold">{personalInfo.name}</h1>
              <p className="text-xl mt-2">{personalInfo.title}</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-2">
                  Contact
                </h3>
                <p>
                  {personalInfo.email} | {personalInfo.phone} |{" "}
                  {personalInfo.location}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-2">
                  Summary
                </h3>
                <p>{personalInfo.about}</p>
              </div>
              {educationList.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-2">
                    Education
                  </h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>
                        {edu.institution} | {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-2">
                    Experience
                  </h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{exp.position}</p>
                      <p>
                        {exp.company} | {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-2">
                  Skills
                </h3>
                <p>{skillArray.join(", ")}</p>
              </div>
              {filteredProjects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-2">
                    Projects
                  </h3>
                  {filteredProjects.map((proj, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{proj.title}</p>
                      <p>{proj.description}</p>
                      {proj.technologies && (
                        <p>Technologies: {proj.technologies}</p>
                      )}
                      {proj.url && (
                        <p>
                          URL:{" "}
                          <a href={proj.url} className="text-blue-600">
                            {proj.url}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 2: // Modern Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-gray-800 text-white font-sans min-h-[297mm]"
          >
            <div className="flex justify-between mb-6">
              <div>
                <h1 className="text-5xl font-extrabold tracking-tight">
                  {personalInfo.name}
                </h1>
                <p className="text-xl mt-2 text-gray-300">
                  {personalInfo.title}
                </p>
              </div>
              <div className="text-right text-sm">
                <p>{personalInfo.email}</p>
                <p>{personalInfo.phone}</p>
                <p>{personalInfo.location}</p>
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">
                Professional Summary
              </h3>
              <p>{personalInfo.about}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {educationList.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-200">
                    Education
                  </h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>{edu.institution}</p>
                      <p className="text-gray-400">
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-200">
                    Experience
                  </h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{exp.position}</p>
                      <p>{exp.company}</p>
                      <p className="text-gray-400">
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-200">
                Skills
              </h3>
              <ul className="flex flex-wrap gap-2">
                {skillArray.map((skill, idx) => (
                  <li
                    key={idx}
                    className="bg-blue-600 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            {filteredProjects.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-200">
                  Projects
                </h3>
                {filteredProjects.map((proj, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="font-medium">{proj.title}</p>
                    <p>{proj.description}</p>
                    {proj.technologies && (
                      <p>Technologies: {proj.technologies}</p>
                    )}
                    {proj.url && (
                      <p>
                        URL:{" "}
                        <a href={proj.url} className="text-blue-300">
                          {proj.url}
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 3: // Elegant Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-blue-50 text-blue-900 font-mono min-h-[297mm]"
          >
            <div className="text-center mb-8">
              <h1
                className="text-5xl font-bold"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                {personalInfo.name}
              </h1>
              <p className="text-xl mt-2 italic">{personalInfo.title}</p>
            </div>
            <div className="border-t-2 border-b-2 border-blue-300 py-4 mb-6 text-center">
              <p>
                {personalInfo.email} | {personalInfo.phone} |{" "}
                {personalInfo.location}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="italic">{personalInfo.about}</p>
            </div>
            {educationList.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Education</h3>
                {educationList.map((edu, idx) => (
                  <div
                    key={idx}
                    className="mb-4 pl-4 border-l-2 border-blue-200"
                  >
                    <p className="font-medium">
                      {edu.degree} in {edu.fieldOfStudy}
                    </p>
                    <p>{edu.institution}</p>
                    <p>
                      {edu.startDate} - {edu.endDate}
                    </p>
                    {edu.grade && <p>Grade: {edu.grade}</p>}
                    <p>{edu.description}</p>
                  </div>
                ))}
              </div>
            )}
            {experienceList.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Experience</h3>
                {experienceList.map((exp, idx) => (
                  <div
                    key={idx}
                    className="mb-4 pl-4 border-l-2 border-blue-200"
                  >
                    <p className="font-medium">{exp.position}</p>
                    <p>{exp.company}</p>
                    <p>
                      {exp.startDate} - {exp.endDate}
                    </p>
                    <p>{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <p>{skillArray.join(" • ")}</p>
            </div>
            {filteredProjects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Projects</h3>
                {filteredProjects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="mb-4 pl-4 border-l-2 border-blue-200"
                  >
                    <p className="font-medium">{proj.title}</p>
                    <p>{proj.description}</p>
                    {proj.technologies && (
                      <p>Technologies: {proj.technologies}</p>
                    )}
                    {proj.url && (
                      <p>
                        URL:{" "}
                        <a href={proj.url} className="text-blue-600">
                          {proj.url}
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 4: // Professional Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-gray-50 text-gray-900 font-serif min-h-[297mm]"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold">{personalInfo.name}</h1>
                <p className="text-xl">{personalInfo.title}</p>
              </div>
              <div className="text-right text-sm">
                <p>{personalInfo.email}</p>
                <p>{personalInfo.phone}</p>
                <p>{personalInfo.location}</p>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Profile</h3>
              <p>{personalInfo.about}</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                {educationList.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Education</h3>
                    {educationList.map((edu, idx) => (
                      <div key={idx} className="mb-4">
                        <p className="font-medium">
                          {edu.degree} in {edu.fieldOfStudy}
                        </p>
                        <p>{edu.institution}</p>
                        <p>
                          {edu.startDate} - {edu.endDate}
                        </p>
                        {edu.grade && <p>Grade: {edu.grade}</p>}
                        <p>{edu.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skills</h3>
                  <ul className="list-disc pl-5">
                    {skillArray.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                {experienceList.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Professional Experience
                    </h3>
                    {experienceList.map((exp, idx) => (
                      <div key={idx} className="mb-4">
                        <p className="font-medium">{exp.position}</p>
                        <p>{exp.company}</p>
                        <p>
                          {exp.startDate} - {exp.endDate}
                        </p>
                        <p>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {filteredProjects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Projects</h3>
                    {filteredProjects.map((proj, idx) => (
                      <div key={idx} className="mb-4">
                        <p className="font-medium">{proj.title}</p>
                        <p>{proj.description}</p>
                        {proj.technologies && (
                          <p>Technologies: {proj.technologies}</p>
                        )}
                        {proj.url && (
                          <p>
                            URL:{" "}
                            <a href={proj.url} className="text-blue-600">
                              {proj.url}
                            </a>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 5: // Contemporary Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-white text-gray-800 font-sans min-h-[297mm]"
          >
            <div className="flex items-center justify-between mb-6 bg-gray-100 p-4 rounded-lg">
              <div>
                <h1 className="text-4xl font-bold">{personalInfo.name}</h1>
                <p className="text-xl">{personalInfo.title}</p>
              </div>
              <div className="text-right text-sm">
                <p>{personalInfo.email}</p>
                <p>{personalInfo.phone}</p>
                <p>{personalInfo.location}</p>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p>{personalInfo.about}</p>
            </div>
            <div className="space-y-6">
              {educationList.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>{edu.institution}</p>
                      <p>
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{exp.position}</p>
                      <p>{exp.company}</p>
                      <p>
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <p>{skillArray.join(", ")}</p>
              </div>
              {filteredProjects.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Projects</h3>
                  {filteredProjects.map((proj, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{proj.title}</p>
                      <p>{proj.description}</p>
                      {proj.technologies && (
                        <p>Technologies: {proj.technologies}</p>
                      )}
                      {proj.url && (
                        <p>
                          URL:{" "}
                          <a href={proj.url} className="text-blue-600">
                            {proj.url}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 6: // Bold Sidebar Template
        return (
          <div ref={resumePreviewRef} className="flex min-h-[297mm]">
            <div className="w-1/3 bg-blue-600 text-white p-6">
              <h1 className="text-4xl font-bold mb-2">{personalInfo.name}</h1>
              <p className="text-xl mb-4">{personalInfo.title}</p>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Contact</h3>
                <p>{personalInfo.email}</p>
                <p>{personalInfo.phone}</p>
                <p>{personalInfo.location}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <ul className="list-none space-y-1">
                  {skillArray.map((skill, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="w-2/3 p-6 bg-white text-gray-800">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Profile</h3>
                <p>{personalInfo.about}</p>
              </div>
              {educationList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>{edu.institution}</p>
                      <p>
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{exp.position}</p>
                      <p>{exp.company}</p>
                      <p>
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {filteredProjects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Projects</h3>
                  {filteredProjects.map((proj, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{proj.title}</p>
                      <p>{proj.description}</p>
                      {proj.technologies && (
                        <p>Technologies: {proj.technologies}</p>
                      )}
                      {proj.url && (
                        <p>
                          URL:{" "}
                          <a href={proj.url} className="text-blue-600">
                            {proj.url}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 7: // Soft Blocks Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-gray-50 text-gray-900 font-serif min-h-[297mm]"
          >
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
              <h1 className="text-4xl font-bold">{personalInfo.name}</h1>
              <p className="text-xl mt-2">{personalInfo.title}</p>
              <p className="text-sm mt-2">
                {personalInfo.email} | {personalInfo.phone} |{" "}
                {personalInfo.location}
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">
                  Professional Summary
                </h3>
                <p>{personalInfo.about}</p>
              </div>
              {educationList.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>{edu.institution}</p>
                      <p>
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{exp.position}</p>
                      <p>{exp.company}</p>
                      <p>
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <p>{skillArray.join(", ")}</p>
              </div>
              {filteredProjects.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">Projects</h3>
                  {filteredProjects.map((proj, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{proj.title}</p>
                      <p>{proj.description}</p>
                      {proj.technologies && (
                        <p>Technologies: {proj.technologies}</p>
                      )}
                      {proj.url && (
                        <p>
                          URL:{" "}
                          <a href={proj.url} className="text-blue-600">
                            {proj.url}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 8: // Minimal Dots Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-white text-gray-800 font-sans min-h-[297mm] relative"
          >
            <div
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1' fill='gray'/></svg>")`,
                backgroundRepeat: "repeat",
                opacity: 0.1,
                position: "absolute",
                inset: 0,
              }}
            ></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">{personalInfo.name}</h1>
              <p className="text-xl mb-4">{personalInfo.title}</p>
              <p className="text-sm mb-6">
                {personalInfo.email} | {personalInfo.phone} |{" "}
                {personalInfo.location}
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p>{personalInfo.about}</p>
                </div>
                {educationList.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Education</h3>
                    {educationList.map((edu, idx) => (
                      <div key={idx} className="mb-4">
                        <p className="font-medium">
                          {edu.degree} in {edu.fieldOfStudy}
                        </p>
                        <p>
                          {edu.institution} | {edu.startDate} - {edu.endDate}
                        </p>
                        {edu.grade && <p>Grade: {edu.grade}</p>}
                        <p>{edu.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {experienceList.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Experience</h3>
                    {experienceList.map((exp, idx) => (
                      <div key={idx} className="mb-4">
                        <p className="font-medium">{exp.position}</p>
                        <p>
                          {exp.company} | {exp.startDate} - {exp.endDate}
                        </p>
                        <p>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skills</h3>
                  <p>{skillArray.join(" • ")}</p>
                </div>
                {filteredProjects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Projects</h3>
                    {filteredProjects.map((proj, idx) => (
                      <div key={idx} className="mb-4">
                        <p className="font-medium">{proj.title}</p>
                        <p>{proj.description}</p>
                        {proj.technologies && (
                          <p>Technologies: {proj.technologies}</p>
                        )}
                        {proj.url && (
                          <p>
                            URL:{" "}
                            <a href={proj.url} className="text-blue-600">
                              {proj.url}
                            </a>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 9: // Sleek Modern Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-sans min-h-[297mm]"
          >
            <div className="mb-6">
              <h1 className="text-5xl font-extrabold tracking-wide">
                {personalInfo.name}
              </h1>
              <p className="text-xl mt-2">{personalInfo.title}</p>
              <p className="text-sm mt-2">
                {personalInfo.email} | {personalInfo.phone} |{" "}
                {personalInfo.location}
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">
                  Professional Summary
                </h3>
                <p>{personalInfo.about}</p>
              </div>
              {educationList.length > 0 && (
                <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>{edu.institution}</p>
                      <p>
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{exp.position}</p>
                      <p>{exp.company}</p>
                      <p>
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <p>{skillArray.join(", ")}</p>
              </div>
              {filteredProjects.length > 0 && (
                <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Projects</h3>
                  {filteredProjects.map((proj, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{proj.title}</p>
                      <p>{proj.description}</p>
                      {proj.technologies && (
                        <p>Technologies: {proj.technologies}</p>
                      )}
                      {proj.url && (
                        <p>
                          URL:{" "}
                          <a href={proj.url} className="text-blue-200">
                            {proj.url}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 10: // Minimalist Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-white text-black font-sans min-h-[297mm]"
          >
            <div className="mb-6">
              <h1 className="text-4xl font-bold">{personalInfo.name}</h1>
              <p className="text-xl">{personalInfo.title}</p>
              <p className="text-sm">
                {personalInfo.email} | {personalInfo.phone} |{" "}
                {personalInfo.location}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <p>{personalInfo.about}</p>
              </div>
              {educationList.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <p>
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>
                        {edu.institution} | {edu.startDate} - {edu.endDate}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-2">
                      <p>{exp.position}</p>
                      <p>
                        {exp.company} | {exp.startDate} - {exp.endDate}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <p>{skillArray.join(", ")}</p>
              </div>
            </div>
          </div>
        );
      case 11: // Corporate Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-white text-black font-serif min-h-[297mm]"
          >
            <div className="bg-gray-100 p-4 mb-6">
              <h1 className="text-4xl font-bold text-center">
                {personalInfo.name}
              </h1>
              <p className="text-xl text-center">{personalInfo.title}</p>
              <p className="text-sm text-center mt-2">
                {personalInfo.email} | {personalInfo.phone} |{" "}
                {personalInfo.location}
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Professional Summary
                </h3>
                <p>{personalInfo.about}</p>
              </div>
              {educationList.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>{edu.institution}</p>
                      <p>
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Professional Experience
                  </h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{exp.position}</p>
                      <p>{exp.company}</p>
                      <p>
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <p>{skillArray.join(", ")}</p>
              </div>
              {filteredProjects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Projects</h3>
                  {filteredProjects.map((proj, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{proj.title}</p>
                      <p>{proj.description}</p>
                      {proj.technologies && (
                        <p>Technologies: {proj.technologies}</p>
                      )}
                      {proj.url && (
                        <p>
                          URL:{" "}
                          <a href={proj.url} className="text-blue-600">
                            {proj.url}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 12: // Creative Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-yellow-50 text-gray-900 font-sans min-h-[297mm]"
          >
            <div className="relative mb-6">
              <h1
                className="text-6xl font-bold text-yellow-600"
                style={{ transform: "rotate(-5deg)" }}
              >
                {personalInfo.name}
              </h1>
              <p className="text-2xl mt-4">{personalInfo.title}</p>
              <p className="text-sm mt-2">
                {personalInfo.email} | {personalInfo.phone} |{" "}
                {personalInfo.location}
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">About Me</h3>
                <p>{personalInfo.about}</p>
              </div>
              {educationList.length > 0 && (
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>{edu.institution}</p>
                      <p>
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{exp.position}</p>
                      <p>{exp.company}</p>
                      <p>
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <p>{skillArray.join(", ")}</p>
              </div>
              {filteredProjects.length > 0 && (
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Projects</h3>
                  {filteredProjects.map((proj, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{proj.title}</p>
                      <p>{proj.description}</p>
                      {proj.technologies && (
                        <p>Technologies: {proj.technologies}</p>
                      )}
                      {proj.url && (
                        <p>
                          URL:{" "}
                          <a href={proj.url} className="text-blue-600">
                            {proj.url}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 13: // Sidebar Layout Template
        return (
          <div ref={resumePreviewRef} className="flex min-h-[297mm]">
            <div className="w-1/3 bg-gray-100 p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{personalInfo.name}</h1>
                <p className="text-lg mt-2">{personalInfo.title}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Contact</h3>
                <p className="flex items-center">
                  <span className="mr-2">📧</span>
                  {personalInfo.email}
                </p>
                <p className="flex items-center">
                  <span className="mr-2">📞</span>
                  {personalInfo.phone}
                </p>
                <p className="flex items-center">
                  <span className="mr-2">📍</span>
                  {personalInfo.location}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <ul className="list-disc pl-5">
                  {skillArray.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="w-2/3 p-6 bg-white text-gray-800">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Professional Summary
                </h3>
                <p>{personalInfo.about}</p>
              </div>
              {educationList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>{edu.institution}</p>
                      <p>
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{exp.position}</p>
                      <p>{exp.company}</p>
                      <p>
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {filteredProjects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Projects</h3>
                  {filteredProjects.map((proj, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{proj.title}</p>
                      <p>{proj.description}</p>
                      {proj.technologies && (
                        <p>Technologies: {proj.technologies}</p>
                      )}
                      {proj.url && (
                        <p>
                          URL:{" "}
                          <a href={proj.url} className="text-blue-600">
                            {proj.url}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 14: // Two-Column Template
        return (
          <div
            ref={resumePreviewRef}
            className="grid grid-cols-2 min-h-[297mm]"
          >
            <div className="p-6 bg-gray-50 text-gray-800">
              <div className="mb-6">
                <h1 className="text-4xl font-bold">{personalInfo.name}</h1>
                <p className="text-xl mt-2">{personalInfo.title}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Contact</h3>
                <p>{personalInfo.email}</p>
                <p>{personalInfo.phone}</p>
                <p>{personalInfo.location}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <p>{skillArray.join(", ")}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p>{personalInfo.about}</p>
              </div>
            </div>
            <div className="p-6 bg-white text-gray-800">
              {educationList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Education</h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p>{edu.institution}</p>
                      <p>
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.grade && <p>Grade: {edu.grade}</p>}
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {experienceList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Experience</h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{exp.position}</p>
                      <p>{exp.company}</p>
                      <p>
                        {exp.startDate} - {exp.endDate}
                      </p>
                      <p>{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {filteredProjects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Projects</h3>
                  {filteredProjects.map((proj, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="font-medium">{proj.title}</p>
                      <p>{proj.description}</p>
                      {proj.technologies && (
                        <p>Technologies: {proj.technologies}</p>
                      )}
                      {proj.url && (
                        <p>
                          URL:{" "}
                          <a href={proj.url} className="text-blue-600">
                            {proj.url}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 15: // Timeline Template
        return (
          <div
            ref={resumePreviewRef}
            className="p-8 bg-white text-black font-serif min-h-[297mm]"
          >
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold">{personalInfo.name}</h1>
              <p className="text-xl mt-2">{personalInfo.title}</p>
              <p className="text-sm mt-2">
                {personalInfo.email} | {personalInfo.phone} |{" "}
                {personalInfo.location}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p>{personalInfo.about}</p>
            </div>
            <div className="relative">
              {educationList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Education</h3>
                  <div className="border-l-2 border-gray-300 pl-6">
                    {educationList.map((edu, idx) => (
                      <div key={idx} className="mb-6 relative">
                        <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                          {idx + 1}
                        </div>
                        <p className="font-medium">
                          {edu.degree} in {edu.fieldOfStudy}
                        </p>
                        <p>{edu.institution}</p>
                        <p>
                          {edu.startDate} - {edu.endDate}
                        </p>
                        {edu.grade && <p>Grade: {edu.grade}</p>}
                        <p>{edu.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {experienceList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Experience</h3>
                  <div className="border-l-2 border-gray-300 pl-6">
                    {experienceList.map((exp, idx) => (
                      <div key={idx} className="mb-6 relative">
                        <div className="absolute -left-3 top-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                          {idx + 1}
                        </div>
                        <p className="font-medium">{exp.position}</p>
                        <p>{exp.company}</p>
                        <p>
                          {exp.startDate} - {exp.endDate}
                        </p>
                        <p>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <p>{skillArray.join(", ")}</p>
            </div>
            {filteredProjects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Projects</h3>
                {filteredProjects.map((proj, idx) => (
                  <div key={idx} className="mb-4">
                    <p className="font-medium">{proj.title}</p>
                    <p>{proj.description}</p>
                    {proj.technologies && (
                      <p>Technologies: {proj.technologies}</p>
                    )}
                    {proj.url && (
                      <p>
                        URL:{" "}
                        <a href={proj.url} className="text-blue-600">
                          {proj.url}
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div
            ref={resumePreviewRef}
            className="p-6 bg-white text-black min-h-[297mm]"
          >
            <h1 className="text-4xl font-bold">{personalInfo.name}</h1>
            <p>{personalInfo.title}</p>
            <p>{personalInfo.about}</p>
            <div>
              <h3>Contact</h3>
              <p>{personalInfo.email}</p>
              <p>{personalInfo.phone}</p>
              <p>{personalInfo.location}</p>
            </div>
            {educationList.length > 0 && (
              <div>
                <h3>Education</h3>
                {educationList.map((edu, idx) => (
                  <div key={idx}>
                    <p>
                      {edu.degree} in {edu.fieldOfStudy}
                    </p>
                    <p>
                      {edu.institution} ({edu.startDate} - {edu.endDate})
                    </p>
                    {edu.grade && <p>Grade: {edu.grade}</p>}
                    <p>{edu.description}</p>
                  </div>
                ))}
              </div>
            )}
            {experienceList.length > 0 && (
              <div>
                <h3>Experience</h3>
                {experienceList.map((exp, idx) => (
                  <div key={idx}>
                    <p>{exp.position}</p>
                    <p>
                      {exp.company} ({exp.startDate} - {exp.endDate})
                    </p>
                    <p>{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
            <div>
              <h3>Skills</h3>
              <p>{skillArray.join(", ")}</p>
            </div>
            {filteredProjects.length > 0 && (
              <div>
                <h3>Projects</h3>
                {filteredProjects.map((proj, idx) => (
                  <div key={idx}>
                    <p>{proj.title}</p>
                    <p>{proj.description}</p>
                    {proj.technologies && (
                      <p>Technologies: {proj.technologies}</p>
                    )}
                    {proj.url && (
                      <p>
                        URL:{" "}
                        <a href={proj.url} className="text-blue-600">
                          {proj.url}
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-10 p-8 bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl rounded-xl">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-gray-800">
          Advanced Resume Builder
        </h2>
        <button
          onClick={cancelOperation}
          className="bg-red-500 hover:bg-red-600 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
        >
          Cancel
        </button>
      </header>

      <div className="mb-6">
        <div className="w-full bg-gray-300 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Step {step + 1} of {totalSteps} ({Math.round(progress)}%)
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-800">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={personalInfo.name}
                  onChange={handlePersonalChange}
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="title"
                  placeholder="Professional Title *"
                  value={personalInfo.title}
                  onChange={handlePersonalChange}
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="location"
                  placeholder="Location *"
                  value={personalInfo.location}
                  onChange={handlePersonalChange}
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={personalInfo.email}
                  onChange={handlePersonalChange}
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={personalInfo.phone}
                  onChange={handlePersonalChange}
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <textarea
                  name="about"
                  placeholder="About You *"
                  value={personalInfo.about}
                  onChange={handlePersonalChange}
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm h-32"
                />
                {errors.about && (
                  <p className="text-red-500 text-sm mt-1">{errors.about}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelOperation}
                className="bg-red-500 hover:bg-red-600 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-800">Education</h3>
            {educationList.map((edu, index) => (
              <div
                key={index}
                className="border p-6 rounded-lg bg-white shadow-md space-y-4"
              >
                <div>
                  <label className="font-semibold text-gray-700">
                    Institution *
                  </label>
                  <input
                    type="text"
                    list="institutions"
                    placeholder="Select or type institution"
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(index, "institution", e.target.value)
                    }
                    className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                  />
                  <datalist id="institutions">
                    {institutions.map((inst, idx) => (
                      <option key={idx} value={inst} />
                    ))}
                  </datalist>
                  {errors.education?.institution && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.education.institution}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Degree *
                  </label>
                  <input
                    type="text"
                    list="degreeOptions"
                    placeholder="Select or type degree"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(index, "degree", e.target.value)
                    }
                    className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                  />
                  <datalist id="degreeOptions">
                    {degreeOptions.map((deg, idx) => (
                      <option key={idx} value={deg} />
                    ))}
                  </datalist>
                  {errors.education?.degree && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.education.degree}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Field of Study *
                  </label>
                  <input
                    type="text"
                    placeholder="Field of Study"
                    value={edu.fieldOfStudy}
                    onChange={(e) =>
                      updateEducation(index, "fieldOfStudy", e.target.value)
                    }
                    className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                  />
                  {errors.education?.fieldOfStudy && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.education.fieldOfStudy}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700">
                      Start Date *
                    </label>
                    <input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducation(index, "startDate", e.target.value)
                      }
                      className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                    />
                    {errors.education?.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.education.startDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700">
                      End Date *
                    </label>
                    <input
                      type="month"
                      value={edu.endDate}
                      onChange={(e) =>
                        updateEducation(index, "endDate", e.target.value)
                      }
                      className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                    />
                    {errors.education?.endDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.education.endDate}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Grade/Percentage
                  </label>
                  <input
                    type="text"
                    placeholder="Grade/Percentage"
                    value={edu.grade}
                    onChange={(e) =>
                      updateEducation(index, "grade", e.target.value)
                    }
                    className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    placeholder="Description"
                    value={edu.description}
                    onChange={(e) =>
                      updateEducation(index, "description", e.target.value)
                    }
                    className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm h-24"
                  />
                </div>
                <button
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove Education
                </button>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="bg-green-600 hover:bg-green-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
            >
              Add Education
            </button>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="bg-gray-600 hover:bg-gray-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-800">Experience</h3>
            {experienceList.map((exp, index) => (
              <div
                key={index}
                className="border p-6 rounded-lg bg-white shadow-md space-y-4"
              >
                <div>
                  <label className="font-semibold text-gray-700">
                    Position *
                  </label>
                  <input
                    type="text"
                    list="positions"
                    placeholder="Select or type position"
                    value={exp.position}
                    onChange={(e) =>
                      updateExperience(index, "position", e.target.value)
                    }
                    className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                  />
                  <datalist id="positions">
                    {positions.map((pos, idx) => (
                      <option key={idx} value={pos} />
                    ))}
                  </datalist>
                  {errors.experience?.position && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.experience.position}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Company *
                  </label>
                  <input
                    type="text"
                    list="companies"
                    placeholder="Select or type company"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(index, "company", e.target.value)
                    }
                    className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                  />
                  <datalist id="companies">
                    {companies.map((comp, idx) => (
                      <option key={idx} value={comp} />
                    ))}
                  </datalist>
                  {errors.experience?.company && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.experience.company}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700">
                      Start Date *
                    </label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(index, "startDate", e.target.value)
                      }
                      className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                    />
                    {errors.experience?.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.experience.startDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700">
                      End Date *
                    </label>
                    <input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) =>
                        updateExperience(index, "endDate", e.target.value)
                      }
                      className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                    />
                    {errors.experience?.endDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.experience.endDate}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    placeholder="Description"
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(index, "description", e.target.value)
                    }
                    className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm h-24"
                  />
                </div>
                <button
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove Experience
                </button>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="bg-green-600 hover:bg-green-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
            >
              Add Experience
            </button>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="bg-gray-600 hover:bg-gray-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-800">
              Projects (Optional)
            </h3>
            {projects.map((proj, index) => (
              <div
                key={index}
                className="border p-6 rounded-lg bg-white shadow-md space-y-4"
              >
                <input
                  type="text"
                  placeholder="Project Title"
                  value={proj.title}
                  onChange={(e) =>
                    updateProject(index, "title", e.target.value)
                  }
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                />
                <textarea
                  placeholder="Project Description"
                  value={proj.description}
                  onChange={(e) =>
                    updateProject(index, "description", e.target.value)
                  }
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm h-24"
                />
                <input
                  type="text"
                  placeholder="Technologies Used"
                  value={proj.technologies}
                  onChange={(e) =>
                    updateProject(index, "technologies", e.target.value)
                  }
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                />
                <input
                  type="url"
                  placeholder="Project URL (Optional)"
                  value={proj.url}
                  onChange={(e) => updateProject(index, "url", e.target.value)}
                  className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
                />
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove Project
                </button>
              </div>
            ))}
            <button
              onClick={addProject}
              className="bg-green-600 hover:bg-green-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
            >
              Add Project
            </button>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="bg-gray-600 hover:bg-gray-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-800">Skills</h3>
            <input
              type="text"
              placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js) *"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 w-full rounded-lg bg-white shadow-sm"
            />
            {errors.skills && (
              <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
            )}
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="bg-gray-600 hover:bg-gray-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-800">
              Select a Resume Template
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`cursor-pointer border p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 ${
                    selectedTemplate.id === template.id
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  <div
                    className={`w-full h-32 ${template.previewColor} ${template.textColor} flex items-center justify-center text-center rounded-t-lg`}
                  >
                    {template.name}
                  </div>
                  <p className="text-center mt-2 text-gray-700">
                    {template.name}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="bg-gray-600 hover:bg-gray-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="step6"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-800">
              Preview & Download
            </h3>
            <div className="mb-6 p-4 bg-blue-100 rounded-lg">
              <h4 className="text-xl font-bold text-blue-800">Resume Score</h4>
              <p className="text-3xl font-bold text-blue-600">
                {calculateResumeScore()}/150
              </p>
              <p className="text-sm text-blue-700 mt-2">
                {calculateResumeScore() < 100
                  ? "Your resume could use some improvement. Consider adding more details to your experience and skills."
                  : "Great job! Your resume is looking strong."}
              </p>
            </div>
            <div
              className="border rounded-lg overflow-hidden shadow-lg bg-white"
              style={{ width: "210mm", margin: "0 auto" }}
            >
              <ResumePreview />
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="bg-gray-600 hover:bg-gray-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                Previous
              </button>
              <button
                onClick={downloadPDF}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700 transition duration-200 text-white px-6 py-2 rounded-lg shadow-md"
              >
                {isGenerating ? "Generating PDF..." : "Download PDF"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilderAdvanced;
