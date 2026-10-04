
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import "../css/ReportAnalytics.css";

function ReportAnalytics() {
  // =====================================================
  // CHART COLORS
  // =====================================================

  // Bar Graph Color
  const BAR_COLOR = "#38BDF8";

  // Pie Chart Colors
  const PIE_COLORS = [
    "#22C55E", // Green - Approved
    "#F59E0B", // Orange - Pending
    "#EF4444", // Red - Rejected
  ];

  // =====================================================
  // REPORT DATA
  // =====================================================

  const [reportData, setReportData] = useState({
    summary: {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    },

    monthlyData: {},

    recentActivity: [],
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH REPORT DATA
  // =====================================================

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/medicines/reports"
      );

      console.log("Report Data:", response.data);

      setReportData(response.data);
    } catch (error) {
      console.log("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // MONTHLY DATA FOR BAR CHART
  // =====================================================

  const monthlyChartData = Object.entries(
    reportData.monthlyData
  ).map(([month, count]) => ({
    month: month,
    donations: count,
  }));

  // =====================================================
  // STATUS DATA FOR PIE CHART
  // =====================================================

  const statusChartData = [
    {
      name: "Approved",
      value: reportData.summary.approved,
    },

    {
      name: "Pending",
      value: reportData.summary.pending,
    },

    {
      name: "Rejected",
      value: reportData.summary.rejected,
    },
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="report-container">
        <h2>Loading Reports...</h2>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="report-container">
      <h1>Reports & Analytics 📊</h1>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="report-cards">

        {/* TOTAL */}

        <div className="report-card">
          <h2>{reportData.summary.total}</h2>

          <p>Total Donations</p>
        </div>


        {/* APPROVED */}

        <div className="report-card">
          <h2>{reportData.summary.approved}</h2>

          <p>Approved</p>
        </div>


        {/* PENDING */}

        <div className="report-card">
          <h2>{reportData.summary.pending}</h2>

          <p>Pending</p>
        </div>


        {/* REJECTED */}

        <div className="report-card">
          <h2>{reportData.summary.rejected}</h2>

          <p>Rejected</p>
        </div>

      </div>


      {/* =================================================
          MONTHLY DONATION BAR GRAPH
      ================================================= */}

      <div className="chart-box">

        <h2>
          Monthly Donation Analytics
        </h2>


        {monthlyChartData.length > 0 ? (

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart
              data={monthlyChartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
              />


              <XAxis
                dataKey="month"
                tick={{ fill: "#CBD5E1" }}
                axisLine={{ stroke: "#475569" }}
                tickLine={{ stroke: "#475569" }}
              />


              <YAxis
                allowDecimals={false}
                tick={{ fill: "#CBD5E1" }}
                axisLine={{ stroke: "#475569" }}
                tickLine={{ stroke: "#475569" }}
              />


              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  border: "1px solid #38BDF8",
                  borderRadius: "10px",
                  color: "#FFFFFF",
                }}
                labelStyle={{
                  color: "#38BDF8",
                  fontWeight: "bold",
                }}
              />


              <Bar
                dataKey="donations"
                name="Donations"
                fill={BAR_COLOR}
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        ) : (

          <p className="no-data">
            No donation data available
          </p>

        )}

      </div>


      {/* =================================================
          STATUS PIE CHART
      ================================================= */}

      <div className="chart-box">

        <h2>
          Donation Status Analytics
        </h2>


        {reportData.summary.total > 0 ? (

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <PieChart>

              <Pie
                data={statusChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >

                {/* DIFFERENT COLOR FOR EACH SECTION */}

                {statusChartData.map(
                  (entry, index) => (

                    <Cell
                      key={`cell-${index}`}
                      fill={
                        PIE_COLORS[
                          index % PIE_COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>


              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  border: "1px solid #38BDF8",
                  borderRadius: "10px",
                  color: "#FFFFFF",
                }}
              />


              <Legend />

            </PieChart>

          </ResponsiveContainer>

        ) : (

          <p className="no-data">
            No donation status data available
          </p>

        )}

      </div>


      {/* =================================================
          RECENT ACTIVITY
      ================================================= */}

      <div className="activity-table">

        <h2>
          Recent Activity
        </h2>


        <table>

          <thead>

            <tr>

              <th>
                Date
              </th>

              <th>
                Donor
              </th>

              <th>
                Medicine
              </th>

              <th>
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            {reportData.recentActivity.length > 0 ? (

              reportData.recentActivity.map(
                (activity, index) => (

                  <tr key={index}>

                    <td>

                      {new Date(
                        activity.date
                      ).toLocaleDateString("en-GB")}

                    </td>


                    <td>
                      {activity.donor}
                    </td>


                    <td>
                      {activity.medicine}
                    </td>


                    <td
                      className={
                        activity.status === "Approved"
                          ? "approved"
                          : activity.status === "Pending"
                          ? "pending"
                          : "rejected"
                      }
                    >

                      {activity.status}

                    </td>

                  </tr>

                )

              )

            ) : (

              <tr>

                <td colSpan="4">

                  No recent activity

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default ReportAnalytics;


