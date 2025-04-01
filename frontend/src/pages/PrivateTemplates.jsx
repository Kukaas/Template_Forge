import { CustomButton, CustomBadge } from '../components/custom-components';
import { FileText, Briefcase, GraduationCap, Plus } from "lucide-react";

const PrivateTemplates = () => {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="space-y-4 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col items-center">
            <CustomBadge variant="primary" size="lg" className="mb-2">
              Premium Access
            </CustomBadge>
            <h1 className="text-3xl font-bold tracking-tighter">
              Your Template Library
            </h1>
          </div>
          <CustomButton variant="gradient">
            <Plus className="h-4 w-4 mr-2" /> Create Template
          </CustomButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Academic Templates */}
          <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <GraduationCap className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-3">Academic</h2>
            <ul className="space-y-2 text-gray-600 mb-4">
              <li className="hover:text-primary cursor-pointer">Research Paper Template</li>
              <li className="hover:text-primary cursor-pointer">Thesis Format</li>
              <li className="hover:text-primary cursor-pointer">Lab Report Template</li>
              <li className="hover:text-primary cursor-pointer">Assignment Template</li>
              <li className="hover:text-primary cursor-pointer">Literature Review</li>
            </ul>
            <CustomButton variant="outline" size="sm" className="w-full">
              View All Academic
            </CustomButton>
          </div>

          {/* Resume Templates */}
          <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <FileText className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-3">Resume</h2>
            <ul className="space-y-2 text-gray-600 mb-4">
              <li className="hover:text-primary cursor-pointer">Professional Resume</li>
              <li className="hover:text-primary cursor-pointer">Executive CV</li>
              <li className="hover:text-primary cursor-pointer">Technical Resume</li>
              <li className="hover:text-primary cursor-pointer">Creative Portfolio</li>
              <li className="hover:text-primary cursor-pointer">Cover Letter</li>
            </ul>
            <CustomButton variant="outline" size="sm" className="w-full">
              View All Resume
            </CustomButton>
          </div>

          {/* Business Templates */}
          <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <Briefcase className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-3">Business</h2>
            <ul className="space-y-2 text-gray-600 mb-4">
              <li className="hover:text-primary cursor-pointer">Business Plan</li>
              <li className="hover:text-primary cursor-pointer">Project Proposal</li>
              <li className="hover:text-primary cursor-pointer">Marketing Plan</li>
              <li className="hover:text-primary cursor-pointer">Financial Report</li>
              <li className="hover:text-primary cursor-pointer">SWOT Analysis</li>
            </ul>
            <CustomButton variant="outline" size="sm" className="w-full">
              View All Business
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateTemplates; 