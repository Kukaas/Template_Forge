import { 
  CustomCard, 
  CustomCardHeader, 
  CustomCardTitle, 
  CustomCardDescription, 
  CustomCardContent,
  CustomBadge,
  CustomTooltip
} from '../components/custom-components';
import { 
  Plus, 
  FileText,
  Settings, 
  Clock 
} from 'lucide-react';

const Dashboard = () => {
    return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
      <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to your personalized dashboard.</p>
        </div>
        <CustomTooltip text="Create new template">
          <CustomBadge variant="default" size="lg" className="cursor-pointer">
            <Plus className="h-4 w-4 mr-1" /> New Template
          </CustomBadge>
        </CustomTooltip>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CustomCard hover>
          <CustomCardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CustomCardTitle>Templates</CustomCardTitle>
            <CustomCardDescription>Manage your templates</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">12</span>
              <CustomBadge variant="success">Active</CustomBadge>
            </div>
          </CustomCardContent>
        </CustomCard>

        <CustomCard hover>
          <CustomCardHeader>
            <Clock className="h-8 w-8 text-primary mb-2" />
            <CustomCardTitle>Recent Activity</CustomCardTitle>
            <CustomCardDescription>Your latest actions</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Template updated - 2h ago</p>
              <p className="text-sm text-muted-foreground">New template created - 5h ago</p>
            </div>
          </CustomCardContent>
        </CustomCard>

        <CustomCard hover>
          <CustomCardHeader>
            <Settings className="h-8 w-8 text-primary mb-2" />
            <CustomCardTitle>Settings</CustomCardTitle>
            <CustomCardDescription>Configure your workspace</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="space-y-2">
              <CustomBadge variant="secondary">Pro Plan</CustomBadge>
            </div>
          </CustomCardContent>
        </CustomCard>
      </div>
      </div>
    );
  };
  
  export default Dashboard;