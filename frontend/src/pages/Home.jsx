import { CustomButton, CustomBadge } from '../components/custom-components';
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Code } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      <div className="space-y-4 max-w-4xl">
        <CustomBadge variant="secondary" size="lg" className="mb-4">
          ✨ The Future of Template Management
        </CustomBadge>
        
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl animate-fade-up">
          Welcome to TemplateForge
        </h1>
        
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 animate-fade-up delay-150">
          Create and manage your templates with ease. Modern, simple, powerful.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-up delay-300">
          <Link to="/login">
            <CustomButton variant="gradient" size="lg">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </CustomButton>
          </Link>
          <Link to="/dashboard">
            <CustomButton variant="outline" size="lg">
              View Dashboard
            </CustomButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="flex flex-col items-center p-4">
            <Zap className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Instant template generation</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Shield className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold">Secure</h3>
            <p className="text-sm text-muted-foreground">Enterprise-grade security</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Code className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold">Customizable</h3>
            <p className="text-sm text-muted-foreground">Fully customizable templates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;