import { CustomButton, CustomBadge } from '../components/custom-components';
import { Link } from "react-router-dom";
import { FileText, Briefcase, GraduationCap, Lock } from "lucide-react";

const Templates = () => {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="space-y-4 max-w-4xl w-full">
        <div className="flex justify-center">
          <CustomBadge variant="primary" size="lg" className="mb-4"> 
            📄 Browse Templates
          </CustomBadge>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tighter text-center mb-8">
          Professional Templates Collection
        </h1>
        
        <p className="text-center mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mb-12">
          Explore our collection of free templates. Sign in to access premium templates and customization features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Academic Templates */}
          <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <GraduationCap className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-3">Academic</h2>
            <ul className="space-y-2 text-gray-600 mb-4">
              <li>Research Paper Template</li>
              <li>Thesis Format</li>
              <li>Lab Report Template</li>
              <li className="flex items-center gap-2 text-gray-400">
                <Lock className="h-4 w-4" /> Assignment Template
              </li>
            </ul>
            <Link to="/login">
              <CustomButton variant="outline" size="sm" className="w-full">
                Unlock Premium Templates
              </CustomButton>
            </Link>
          </div>

          {/* Resume Templates */}
          <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <FileText className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-3">Resume</h2>
            <ul className="space-y-2 text-gray-600 mb-4">
              <li>Basic Resume</li>
              <li>Student Resume</li>
              <li className="flex items-center gap-2 text-gray-400">
                <Lock className="h-4 w-4" /> Professional Resume
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Lock className="h-4 w-4" /> Technical Resume
              </li>
            </ul>
            <Link to="/login">
              <CustomButton variant="outline" size="sm" className="w-full">
                Unlock Premium Templates
              </CustomButton>
            </Link>
          </div>

          {/* Business Templates */}
          <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <Briefcase className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-3">Business</h2>
            <ul className="space-y-2 text-gray-600 mb-4">
              <li>Simple Proposal</li>
              <li>Meeting Agenda</li>
              <li className="flex items-center gap-2 text-gray-400">
                <Lock className="h-4 w-4" /> Full Business Plan
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Lock className="h-4 w-4" /> Project Timeline
              </li>
            </ul>
            <Link to="/login">
              <CustomButton variant="outline" size="sm" className="w-full">
                Unlock Premium Templates
              </CustomButton>
            </Link>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <Link to="/login">
            <CustomButton variant="gradient" size="lg">
              Sign in to Access All Templates
            </CustomButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Templates; 