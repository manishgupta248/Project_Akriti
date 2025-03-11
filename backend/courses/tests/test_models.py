from django.test import TestCase
from courses.models import Course

class CourseModelTest(TestCase):
    def test_course_creation(self):
        course = Course.objects.create(
            course_code="CS101",
            course_name="Intro to Programming",
            course_category="COMPULSORY",
            type="THEORY",
            cbcs_category="CORE",
            maximum_credit=3,
            discipline_id=101  # Adjust to a valid Department ID
        )
        self.assertEqual(course.course_name, "Intro to Programming")