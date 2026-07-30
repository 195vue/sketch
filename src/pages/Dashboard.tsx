import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Users,
  Building2,
  Target,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  dashboardStats,
  exportTrend,
  successRateData,
  recentTasks,
  memberStats,
  projects,
  tenants,
  drawings,
  tasks,
} from '../utils/mockData';
import { TaskStatusMap } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const Dashboard = () => {
  const navigate = useNavigate();

  const lineChartData = {
    labels: exportTrend.map((item) => item.date),
    datasets: [
      {
        label: '出图量',
        data: exportTrend.map((item) => item.count),
        borderColor: '#1e3a5f',
        backgroundColor: 'rgba(30, 58, 95, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1e3a5f',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e3a5f',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: { size: 12 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 12 },
        },
      },
    },
  };

  const doughnutChartData = {
    labels: ['成功', '异常'],
    datasets: [
      {
        data: [successRateData.success, successRateData.exception],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#fff', '#fff'],
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e3a5f',
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const barChartData = {
    labels: memberStats.map((item) => item.name),
    datasets: [
      {
        label: '出图量',
        data: memberStats.map((item) => item.count),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        hoverBackgroundColor: '#2563eb',
      },
    ],
  };

  const barChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e3a5f',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1:
        return <span className="tag tag-pending">{TaskStatusMap[status]}</span>;
      case 2:
        return <span className="tag tag-processing">{TaskStatusMap[status]}</span>;
      case 3:
        return <span className="tag tag-completed">{TaskStatusMap[status]}</span>;
      case 4:
        return <span className="tag tag-exception">{TaskStatusMap[status]}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">数据看板</h1>
          <p className="text-gray-500 mt-1">欢迎回来，查看今日数据概览</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>数据更新时间：</span>
          <span className="font-medium text-gray-700">2024-06-08 15:30:00</span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-6">
        <div
          className="card p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/projects')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">项目总数</p>
              <p className="text-3xl font-bold text-primary-800 mt-2">{projects.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-primary-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-success-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            较上月增长 12%
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">图纸总数</p>
              <p className="text-3xl font-bold text-primary-800 mt-2">{drawings.length}</p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-success-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            较上月增长 8%
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">本月出图量</p>
              <p className="text-3xl font-bold text-success-600 mt-2">{dashboardStats.monthlyExportCount}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-success-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            目标完成率 75%
          </div>
        </div>

        <div
          className="card p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/tasks')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">待处理任务</p>
              <p className="text-3xl font-bold text-danger-600 mt-2">{tasks.filter((t) => t.status === 1).length}</p>
            </div>
            <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-danger-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-gray-500 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            需及时处理
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">租户数量</p>
              <p className="text-3xl font-bold text-primary-800 mt-2">{tenants.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-success-500 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            活跃租户 {tenants.filter((t) => t.status === 1).length} 个
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">AI识别成功率</p>
              <p className="text-3xl font-bold text-success-600 mt-2">{successRateData.success}%</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-success-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-gray-500 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            异常率 {successRateData.exception}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">出图趋势</h2>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg font-medium">
                近7天
              </button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg font-medium">
                近30天
              </button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg font-medium">
                近90天
              </button>
            </div>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">AI识别成功率</h2>
          <div className="h-48 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">{successRateData.success}%</span>
                <span className="text-sm text-gray-500">成功率</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">成功</span>
              <span className="text-success-600 font-medium">{successRateData.success}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">异常</span>
              <span className="text-danger-600 font-medium">{successRateData.exception}%</span>
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3">
              <p className="text-xs text-gray-400 mb-2">异常原因分布</p>
              {successRateData.exceptionBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="text-gray-600">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">最近任务</h2>
            <button
              onClick={() => navigate('/tasks')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task.drawingName}</p>
                    <p className="text-xs text-gray-500">{task.submitterName} · {task.submittedAt}</p>
                  </div>
                </div>
                {getStatusTag(task.status)}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">成员出图统计</h2>
          <div className="h-48">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            展示当前可见范围内出图量Top5成员
          </div>
        </div>
      </div>
    </div>
  );
};