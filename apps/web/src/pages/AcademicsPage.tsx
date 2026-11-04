import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchSemesters,
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../features/academics/api.js';
import type {
  AcademicSemesterDto,
  AcademicCourseDto,
  UnderstandingLevel,
  AcademicStatus,
} from '@kenenisa-os/shared';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';
import { getCachedApiData } from '../lib/api-client.js';
import { LoadingSkeleton } from '../components/ui/StateCard.js';

export const AcademicsPage: React.FC = () => {
  const [semesters, setSemesters] = useState<AcademicSemesterDto[]>(
    () => getCachedApiData<AcademicSemesterDto[]>('/api/v1/academics/semesters') || [],
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(() => {
    const cached = getCachedApiData<AcademicSemesterDto[]>('/api/v1/academics/semesters');
    const active = cached?.find((s) => s.status === 'ACTIVE') || cached?.[0];
    return active ? active.id : '';
  });
  const [courses, setCourses] = useState<AcademicCourseDto[]>([]);
  const [loading, setLoading] = useState(() => semesters.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Edit / Add modal state
  const [editingCourse, setEditingCourse] = useState<AcademicCourseDto | null>(null);
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    creditHours: 3,
    instructor: '',
    academicStatus: 'ENROLLED' as AcademicStatus,
    currentUnderstanding: 'DEVELOPING' as UnderstandingLevel,
    notes: '',
    completionRequirements: '',
  });

  const loadSemestersAndCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const semList = await fetchSemesters();
      setSemesters(semList);

      const activeSem = semList.find((s) => s.status === 'ACTIVE') || semList[0];
      if (activeSem) {
        setSelectedSemesterId(activeSem.id);
        const courseList = await fetchCourses(activeSem.id);
        setCourses(courseList);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSemestersAndCourses();
  }, []);

  const handleSemesterChange = async (semId: string) => {
    setSelectedSemesterId(semId);
    try {
      setLoading(true);
      const courseList = await fetchCourses(semId);
      setCourses(courseList);
    } catch (err: any) {
      alert(`Error loading courses: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsNewCourse(true);
    setEditingCourse(null);
    setFormData({
      title: '',
      code: '',
      creditHours: 3,
      instructor: '',
      academicStatus: 'ENROLLED',
      currentUnderstanding: 'DEVELOPING',
      notes: '',
      completionRequirements: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (course: AcademicCourseDto) => {
    setIsNewCourse(false);
    setEditingCourse(course);
    setFormData({
      title: course.title,
      code: course.code || '',
      creditHours: course.creditHours || 3,
      instructor: course.instructor || '',
      academicStatus: course.academicStatus,
      currentUnderstanding: course.currentUnderstanding,
      notes: course.notes || '',
      completionRequirements: course.completionRequirements || '',
    });
    setModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Course title is required');
      return;
    }

    try {
      setSaving(true);
      if (isNewCourse) {
        await createCourse({
          semesterId: selectedSemesterId,
          title: formData.title,
          code: formData.code || undefined,
          creditHours: Number(formData.creditHours) || 3,
          instructor: formData.instructor || undefined,
          academicStatus: formData.academicStatus,
          currentUnderstanding: formData.currentUnderstanding,
          notes: formData.notes || undefined,
          completionRequirements: formData.completionRequirements || undefined,
        });
      } else if (editingCourse) {
        await updateCourse(editingCourse.id, {
          title: formData.title,
          code: formData.code || null,
          creditHours: Number(formData.creditHours) || null,
          instructor: formData.instructor || null,
          academicStatus: formData.academicStatus,
          currentUnderstanding: formData.currentUnderstanding,
          notes: formData.notes || null,
          completionRequirements: formData.completionRequirements || null,
        });
      }

      setModalOpen(false);
      const updatedList = await fetchCourses(selectedSemesterId);
      setCourses(updatedList);
    } catch (err: any) {
      alert(`Error saving course: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) {
      return;
    }
    try {
      await deleteCourse(id);
      const updatedList = await fetchCourses(selectedSemesterId);
      setCourses(updatedList);
    } catch (err: any) {
      alert(`Error deleting course: ${err.message}`);
    }
  };

  const handleQuickStatusChange = async (course: AcademicCourseDto, newStatus: AcademicStatus) => {
    try {
      await updateCourse(course.id, { academicStatus: newStatus });
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, academicStatus: newStatus } : c))
      );
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleQuickUnderstandingChange = async (
    course: AcademicCourseDto,
    newLevel: UnderstandingLevel
  ) => {
    try {
      await updateCourse(course.id, { currentUnderstanding: newLevel });
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, currentUnderstanding: newLevel } : c))
      );
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const getStatusBadge = (status: AcademicStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'AUDITING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DROPPED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'ENROLLED':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getUnderstandingBadge = (level: UnderstandingLevel) => {
    switch (level) {
      case 'EXPERT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold';
      case 'ADVANCED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PROFICIENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DEVELOPING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'BEGINNER':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const currentSemester = semesters.find((s) => s.id === selectedSemesterId);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                ASTU ACADEMICS
              </span>
              <span className="text-xs text-slate-500">
                {currentSemester?.academicYear || '2026/2027'} • {currentSemester?.level || 'Fifth Year'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Academic Course Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track course obligations, credit hours, instructors, study topics, and mastery level for ASTU graduation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/graduation"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors border border-slate-200/60"
            >
              ← Graduation Overview
            </Link>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>+ Add Course</span>
            </button>
          </div>
        </div>

        {/* Semester Selector & Quick Stats */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Active Semester:</label>
            <select
              value={selectedSemesterId}
              onChange={(e) => handleSemesterChange(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.academicYear} — {s.semester} ({s.level})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span>
              Total Courses:{' '}
              <strong className="text-slate-900 font-bold">{courses.length}</strong>
            </span>
            <span>•</span>
            <span>
              Total Credits:{' '}
              <strong className="text-slate-900 font-bold">
                {courses.reduce((acc, c) => acc + (c.creditHours || 0), 0)}
              </strong>
            </span>
            <span>•</span>
            <span>
              Completed:{' '}
              <strong className="text-emerald-600 font-bold">
                {courses.filter((c) => c.academicStatus === 'COMPLETED').length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadSemestersAndCourses} className="font-semibold underline">Retry</button>
        </div>
      ) : null}

      {/* Courses Table / Cards */}
      {loading && courses.length === 0 ? (
        <LoadingSkeleton rows={4} height="h-24" />
      ) : courses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-xs">
          <p className="text-sm font-semibold text-slate-700">No courses configured for this semester</p>
          <p className="text-xs text-slate-500 mt-1">Add your ASTU courses to start tracking obligations.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
          >
            Add First Course
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/70">
                      {course.code || 'NO-CODE'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{course.title}</h3>
                    {course.creditHours ? (
                      <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                        {course.creditHours} cr
                      </span>
                    ) : null}
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-y-1 gap-x-4 pt-0.5">
                    {course.instructor ? (
                      <span>
                        Instructor: <strong className="text-slate-700">{course.instructor}</strong>
                      </span>
                    ) : (
                      <span className="italic text-slate-400">Instructor: Not configured</span>
                    )}

                    {course.notes ? (
                      <span className="line-clamp-1 text-slate-600">Note: {course.notes}</span>
                    ) : null}

                    {course.project ? (
                      <span className="text-purple-600 font-medium">
                        Linked Project: {course.project.name}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Status Dropdown */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Status</span>
                    <select
                      value={course.academicStatus}
                      onChange={(e) => handleQuickStatusChange(course, e.target.value as AcademicStatus)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${getStatusBadge(
                        course.academicStatus
                      )}`}
                    >
                      <option value="ENROLLED">Enrolled</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="AUDITING">Auditing</option>
                      <option value="DROPPED">Dropped</option>
                    </select>
                  </div>

                  {/* Understanding Level Dropdown */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Mastery</span>
                    <select
                      value={course.currentUnderstanding}
                      onChange={(e) =>
                        handleQuickUnderstandingChange(course, e.target.value as UnderstandingLevel)
                      }
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${getUnderstandingBadge(
                        course.currentUnderstanding
                      )}`}
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="DEVELOPING">Developing</option>
                      <option value="PROFICIENT">Proficient</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 sm:pt-0">
                    <button
                      onClick={() => openEditModal(course)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 rounded-lg transition-colors shadow-2xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Add / Edit Course */}
      {modalOpen ? (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {isNewCourse ? 'Add Academic Course' : 'Edit Academic Course'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE-510"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.creditHours}
                    onChange={(e) => setFormData({ ...formData, creditHours: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructor Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Abebe"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Status
                  </label>
                  <select
                    value={formData.academicStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, academicStatus: e.target.value as AcademicStatus })
                    }
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="ENROLLED">Enrolled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="AUDITING">Auditing</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Understanding
                  </label>
                  <select
                    value={formData.currentUnderstanding}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentUnderstanding: e.target.value as UnderstandingLevel,
                      })
                    }
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="DEVELOPING">Developing</option>
                    <option value="PROFICIENT">Proficient</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes & Key Obligations
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Lab reports due bi-weekly, midterm in week 8"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : isNewCourse ? 'Add Course' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Embedded Central AI Copilot */}
      <PageAiCopilot pageType="academics" />
    </div>
  );
};
