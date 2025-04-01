import { useEffect, useState } from 'react';
import { CustomCard, CustomBadge } from '../../components/custom-components';

const SuperAdmin = () => {
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch admin data');
        }

        const data = await response.json();
        setAdminData(data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <CustomBadge variant="primary" size="lg" className="mb-4">
            Super Admin Dashboard
          </CustomBadge>
          <h1 className="text-3xl font-bold tracking-tighter mb-4">
            System Administration
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomCard>
            <h2 className="text-xl font-semibold mb-4">System Overview</h2>
            {/* Add your admin controls and data here */}
          </CustomCard>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin; 