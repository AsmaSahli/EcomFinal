import React from 'react'
import MetabaseDashboard from '../MetabaseDashboard'

const DashAnalytics = () => {
  return (
    <div>
          <div className="space-y-6">
            {/* Header and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Analytics</h2>
                <p className="text-gray-600">Powerd by Metabase</p>
              </div>

            </div>
      <MetabaseDashboard dashboardId="2" /> 
          </div>


    </div>
  )
}

export default DashAnalytics