import { render, screen } from '@testing-library/react';
import SyllabiPage from '../page';

// Mock the stores
jest.mock('@/store/syllabusStore', () => ({
  useSyllabusStore: () => ({
    syllabi: [],
    page: 1,
    limit: 10,
    totalCount: 0,
    loading: false,
    error: null,
    fetchSyllabi: jest.fn(),
  }),
}));
jest.mock('@/store/courseStore', () => ({
  useCourseStore: () => ({
    courses: [],
    fetchCourses: jest.fn(),
  }),
}));

test('renders Syllabi heading', () => {
  render(<SyllabiPage />);
  const heading = screen.getByText(/Syllabi/i);
  expect(heading).toBeInTheDocument();
});