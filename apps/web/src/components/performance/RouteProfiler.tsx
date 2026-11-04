import React, { Profiler, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { webPerformanceProfiler } from '../../lib/performance-profiler.js';

interface RouteProfilerProps {
  id: string;
  children: React.ReactNode;
}

export const RouteProfiler: React.FC<RouteProfilerProps> = ({ id, children }) => {
  const location = useLocation();

  useEffect(() => {
    webPerformanceProfiler.startRouteNavigation(id);
  }, [id, location.pathname]);

  const handleRender: React.ProfilerOnRenderCallback = (
    profilerId,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  ) => {
    webPerformanceProfiler.recordReactRender(
      profilerId,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    );
  };

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};

