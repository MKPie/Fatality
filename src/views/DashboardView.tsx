import React from 'react';
import { Database, Package, TrendingUp, Zap, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const stats = [
    { 
      label: 'Products Scraped', 
      value: '1,247', 
      change: '+12%', 
      icon: Database,
      color: 'blue',
      trend: 'up'
    },
    { 
      label: 'Tags Updated', 
      value: '3,891', 
      change: '+8%', 
      icon: Package,
      color: 'green',
      trend: 'up'
    },
    { 
      label: 'Weight Syncs', 
      value: '542', 
      change: '+5%', 
      icon: TrendingUp,
      color: 'purple',
      trend: 'up'
    },
    { 
      label: 'API Calls Today', 
      value: '127', 
      change: '-3%', 
      icon: Zap,
      color: 'orange',
      trend: 'down'
    }
  ];

  const recentActivity = [
    { time: '2 min ago', action: 'Completed weight sync', status: 'success', details: '127 products updated' },
    { time: '15 min ago', action: 'Tag update started', status: 'processing', details: 'Processing batch 3/5' },
    { time: '1 hour ago', action: 'Scraping completed', status: 'success', details: '45 new products added' },
    { time: '2 hours ago', action: 'Eniture sync failed', status: 'error', details: 'API timeout' },
    { time: '3 hours ago', action: 'Weight update completed', status: 'success', details: '89% success rate' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {getStatusIcon(activity.status)}
                  <span>{activity.status}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Backend API</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Shopify Connection</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Eniture API</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ChromeDriver</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Ready
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Start Scraping
            </button>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              Update Tags
            </button>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
              Sync Weights
            </button>
            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
              Run Eniture Sync
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
