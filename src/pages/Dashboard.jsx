import React from "react";
import {
  Users,
  Cloud,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const data = null;

  // Mock data - replace with actual data from your API
  const stats = [
    {
      title: "Total Customers",
      value: data?.totalCustomers ?? 0,
      change: `${data?.customersChange ?? 0}%`,
      changeType: data?.customersChange >= 0 ? "positive" : "negative",
      icon: Users,
      color: "bg-gradient-to-r from-orange-500 to-amber-500",
    },
    {
      title: "Weather Stations",
      value: data?.totalWeatherStations ?? 0,
      change: `${data?.weatherStationsChange ?? 0}%`,
      changeType: data?.weatherStationsChange >= 0 ? "positive" : "negative",
      icon: Cloud,
      color: "bg-green-500",
    },
    {
      title: "Total Blogs",
      value: data?.totalBlogs ?? 0,
      change: `${data?.blogsChange ?? 0}%`,
      changeType: data?.blogsChange >= 0 ? "positive" : "negative",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      title: "Weather Services",
      value: data?.totalWeatherServices ?? 0,
      change: `${data?.weatherServicesChange ?? 0}%`,
      changeType: data?.weatherServicesChange >= 0 ? "positive" : "negative",
      icon: Cloud,
      color: "bg-purple-500",
    },
  ];

  // const recentActivities = [
  //   {
  //     id: 1,
  //     type: "user",
  //     message: "New user registered: john.doe@example.com",
  //     time: "2 minutes ago",
  //     status: "success",
  //   },
  //   {
  //     id: 2,
  //     type: "weather",
  //     message: "Weather data updated for Station #23",
  //     time: "5 minutes ago",
  //     status: "info",
  //   },
  //   {
  //     id: 3,
  //     type: "alert",
  //     message: "High temperature alert for Dhaka region",
  //     time: "10 minutes ago",
  //     status: "warning",
  //   },
  //   {
  //     id: 4,
  //     type: "system",
  //     message: "System backup completed successfully",
  //     time: "15 minutes ago",
  //     status: "success",
  //   },
  // ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Clock className="w-4 h-4 text-primary" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === "positive" ? (
                <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      {/*<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">*/}
      {/*  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">*/}
      {/*    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">*/}
      {/*      Recent Activities*/}
      {/*    </h2>*/}
      {/*  </div>*/}
      {/*  <div className="p-6">*/}
      {/*    <div className="space-y-4">*/}
      {/*      {recentActivities.map((activity) => (*/}
      {/*        <div*/}
      {/*          key={activity.id}*/}
      {/*          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"*/}
      {/*        >*/}
      {/*          {getStatusIcon(activity.status)}*/}
      {/*          <div className="flex-1">*/}
      {/*            <p className="text-sm text-gray-900 dark:text-white">*/}
      {/*              {activity.message}*/}
      {/*            </p>*/}
      {/*            <p className="text-xs text-gray-500 dark:text-gray-400">*/}
      {/*              {activity.time}*/}
      {/*            </p>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Link to={"/registration-requests"}>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Manage Customer
                  </span>
                </div>
              </Link>
            </button>
            <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Link to={"/forecast"}>
                <div className="flex items-center space-x-3">
                  <Cloud className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Forecast
                  </span>
                </div>
              </Link>
            </button>
            <button className="w-full text-left p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Link to={"/system/menus"}>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Menus
                  </span>
                </div>
              </Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
