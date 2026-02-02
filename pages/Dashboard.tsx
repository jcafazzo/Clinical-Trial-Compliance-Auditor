import React, { useMemo } from 'react';
import { TrialData } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { AlertCircle, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { differenceInWeeks, parseISO } from 'date-fns';

interface DashboardProps {
  data: TrialData[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  
  const metrics = useMemo(() => {
    const total = data.length;
    const withTRN = data.filter(d => d.hasTRN).length;
    
    // Filter for valid date records for prospective analysis
    const validDateRecords = data.filter(d => d.hasTRN && d.registrationDate && d.enrollmentDate);
    
    let prospective = 0;
    let retrospective = 0;
    const delays: number[] = [];

    validDateRecords.forEach(d => {
      const reg = parseISO(d.registrationDate!);
      const enroll = parseISO(d.enrollmentDate!);
      
      if (reg <= enroll) {
        prospective++;
      } else {
        retrospective++;
        delays.push(differenceInWeeks(reg, enroll));
      }
    });

    const icmjeJournals = data.filter(d => d.isICMJEMember);
    const nonIcmjeJournals = data.filter(d => !d.isICMJEMember);

    return {
      total,
      withTRN,
      trnRate: (withTRN / total) * 100,
      prospective,
      retrospective,
      prospectiveRate: (prospective / validDateRecords.length) * 100,
      icmjeTrnRate: (icmjeJournals.filter(d => d.hasTRN).length / icmjeJournals.length) * 100,
      nonIcmjeTrnRate: (nonIcmjeJournals.filter(d => d.hasTRN).length / nonIcmjeJournals.length) * 100,
      delays
    };
  }, [data]);

  // Histogram Data for Delayed Registration
  const histogramData = useMemo(() => {
    const bins = Array(20).fill(0).map((_, i) => ({ week: i + 1, count: 0 }));
    metrics.delays.forEach(delay => {
      // delay is in weeks. If delay is 0-1 weeks, it goes to bin 1.
      const binIndex = Math.min(Math.max(0, Math.floor(delay)), 19);
      if (binIndex >= 0) bins[binIndex].count++;
    });
    return bins;
  }, [metrics.delays]);

  // BMJ Palette: Navy, Muted Red, Gold, Slate
  const COLORS = ['#002F6C', '#D10000', '#EAB308', '#64748B'];

  return (
    <div className="space-y-8 font-sans text-slate-800">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-[#002F6C] font-serif">Compliance Dashboard</h2>
        <p className="text-slate-600 mt-2 font-serif italic text-lg">
          Analysis based on <span className="font-semibold not-italic">{metrics.total}</span> randomised clinical trials.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded border-t-4 border-[#002F6C] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">TRN Reporting</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2 font-serif">{metrics.trnRate.toFixed(1)}%</h3>
            </div>
            <div className="text-[#002F6C]">
              <BookOpen size={24} strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">Target: 100% (ICMJE)</div>
        </div>

        <div className="bg-white p-5 rounded border-t-4 border-[#002F6C] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Prospective Reg.</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2 font-serif">{metrics.prospectiveRate.toFixed(1)}%</h3>
            </div>
            <div className={`${metrics.prospectiveRate > 50 ? 'text-emerald-600' : 'text-red-600'}`}>
              <CheckCircle2 size={24} strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">Reg. date ≤ Enrollment date</div>
        </div>

        <div className="bg-white p-5 rounded border-t-4 border-[#002F6C] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">ICMJE Compliance</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2 font-serif">{metrics.icmjeTrnRate.toFixed(1)}%</h3>
            </div>
            <div className="text-purple-600">
              <AlertCircle size={24} strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">Papers in member journals</div>
        </div>

        <div className="bg-white p-5 rounded border-t-4 border-[#002F6C] shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Retrospective</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2 font-serif">{metrics.retrospective}</h3>
            </div>
            <div className="text-orange-600">
              <Clock size={24} strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">Trials registered late</div>
        </div>
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Registration Timing Pie Chart */}
        <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 font-serif border-b border-slate-100 pb-2">Registration Timing</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Prospective', value: metrics.prospective },
                    { name: 'Retrospective', value: metrics.retrospective }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell key="cell-0" fill={COLORS[0]} />
                  <Cell key="cell-1" fill={COLORS[1]} />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '4px', fontFamily: 'Inter' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="square"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center uppercase tracking-wide">
            Compared to enrollment start date
          </p>
        </div>

        {/* ICMJE vs Non-ICMJE Bar Chart */}
        <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 font-serif border-b border-slate-100 pb-2">TRN Reporting by Journal Type</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'ICMJE Member', rate: metrics.icmjeTrnRate },
                  { name: 'Non-Member', rate: metrics.nonIcmjeTrnRate },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} />
                <YAxis unit="%" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} />
                <Tooltip 
                   cursor={{fill: '#f1f5f9'}} 
                   contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '4px', fontFamily: 'Inter' }}
                />
                <Bar dataKey="rate" fill="#002F6C" radius={[2, 2, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            ICMJE members are significantly more likely to report TRNs.
          </p>
        </div>
      </div>

      {/* Row 2: Delayed Registration Histogram */}
      <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
          <h3 className="text-lg font-bold text-slate-900 font-serif">Delayed Registration Trend</h3>
          <span className="text-[10px] uppercase font-bold text-[#002F6C] tracking-widest bg-blue-50 px-2 py-1 rounded">Retrospective Trials Only</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={histogramData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="week" 
                label={{ value: 'Weeks after Enrollment', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 12 }} 
                tick={{fill: '#475569', fontSize: 12}}
              />
              <YAxis 
                label={{ value: 'Number of Trials', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 12 }} 
                tick={{fill: '#475569', fontSize: 12}}
              />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '4px', fontFamily: 'Inter' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#D10000" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#D10000' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-slate-600 mt-4 leading-relaxed font-serif">
          <strong className="text-slate-900">Selective Registration Bias:</strong> A significant portion of retrospective registrations occur in the first few weeks after enrollment or just before publication.
        </p>
      </div>

      <div className="bg-white border-l-4 border-[#002F6C] p-6 shadow-sm rounded-r">
        <h4 className="font-bold text-[#002F6C] mb-2 font-serif text-lg">Study Insight</h4>
        <p className="text-slate-700 text-sm leading-relaxed">
          The original paper found that 85.2% of trials registered retrospectively within a year of submission were registered in the first 3-8 weeks. 
          This "Selective Registration Bias" suggests investigators may register only after initial positive signals or when preparing for publication.
        </p>
      </div>
    </div>
  );
};