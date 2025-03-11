# Project_Akriti - Django-NextJS BoilerPlate

# Project Feature

-   Django Backend

    *   Restful APIs with Django-rest-framework (DRF) with pagination Django-Fliter. 
    *   Authentication with Restframework-simplejwt, Token handeled in httpOnly Cookie with
        Access_Toke and refresh_Token intercepter.
    *   custome usr model (Fileds - Email, first_name, last_name, mobile_number, profile_picture,
        created_at, updated_at).
    *   Authentication APIs endpints for Login, logout (Restframework-simplejwt[blacklist]), user-update
        and change_password
    *   Django-cors-headers to allow API calls from frontend
    *   Django-decouple to use Environmental variables
    *   Comprehensive OpenAPI documentation is automatically generated using drf_spectacular, ensuring API
        clarity and ease of integration.(Further work is required)
    *   PostGRE SQl for Database management 
    *   Django-Import-Export Is used for admin Import-Export

-   NaxtJS Frontend

    *   src folder for file managment with APP router 
    *   '.env.local' file used for APIs edpoints nevigation
    *   'Axios' to make API Calls
    *   'Zustand' for state managment with defined typeScript variables
    *   'React-hot-toast' used for Notifications
    *   'React-hook-form' with dynamic search field inplace of select
    *   'React-select'  is For dynamic searchable dropdown
    *   'TailwindCSS' is used for Styling
    *   Dynamic NavBar, Sidebar and Footer Components
    *   Pages with Search and tables with filter options
    *   Paginamtion and Dynamic display of fields details

------------------------------------------------------------------------------
#   Athrntication Model Implemantation 

    *   "The 'university' project, a Django backend, features an 'accounts' application designed for robust
        and secure user authentication. 
    *   This application leverages JSON Web Tokens (JWT) for authentication, utilizing Django REST
        Framework, restframework-simplejwt, and rest_framework_simplejwt.token_blacklist to create a suite of RESTful authentication APIs. 
    *   To maximize security, authentication tokens are stored exclusively in HTTP-only cookies, preventing
        client-side JavaScript access. 
    *   The 'accounts' application provides the following endpoints:
        RegisterView: 
        -   User registration.
        -   CustomTokenObtainPairView: JWT access and refresh token generation.
        -   LogoutView: Token invalidation and user logout.
        -   UserProfileView: User profile retrieval.
        -   ChangePasswordView: User password modification.
        -   CustomTokenRefreshView: Refresh token-based access token renewal.

    *   A custom authentication backend has been implemented to retrieve access tokens directly from
        HTTP-only cookies, eliminating reliance on the standard Authorization header. 

    *   The 'CustomUser' model encompasses fields for 
        -   email as user ID, first name, last name, Indian mobile number, date joined, last updated, and 
            profile picture catering to specific application requirements. 

    -   
    -   Furthermore, django-cors-headers is configured to enable cross-origin requests, facilitating
        seamless communication with the frontend application."
#   Other Apps
    1.  Academics App
        -   Model - Department (id, Name, Faculty, created by, updated by, created at)
        -   Custom id generation

    2.  Courses App
        - Models - Course, Syllbus
        - Pagination implemanted
        - Filtering
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

#   Project Implemantation 
1.  Setup Backend

    >   mkdir backend
    >   cd backend
    >   py -m venv venv                                     #   Create Virtual Environment (VE)
    >   venv\Scripts\activate                               #   Activate VE

-   Install Django and Dependancies 
    >   py -m pip install django
    >   py -m pip install djangorestframework
    >   py -m pip install djangorestframework-simplejwt
    >   py -m pip install django-cors-headers               #   Cors-Headers
    >   py -m pip install drf-spectacular                   #   OpenAPI
    >   py -m pip install django-decouple 
    >   py -m pip install  psycopg2-binary                  #   For PosrGRE SQL
    >   py -m pip install Pillow                            #   To handle Images
    >   py -m pip install django-filter                     #   For Django Fillter 
    >   py -m pip install django-import-export              #   To Add Import Export Facility on admin panel
    >   py -m pip install openpyxl                          #   To Manage Excel Files

-   Create Django project and authentication app 'accounts'
    >   django-admin startproject university .
    >   py manage.py startapp accounts

2.  Create .env file in project root and update with 
    SECRET_KEY=gxqb^=t$=hm08%r!j*%&358j38i!3s1g4t%^$yp$5=%t&lwmf#
    DEBUG=True

3.  Update university/settings.py 

4.  Create Model in accounts/models.py

5.  Run migrations and create Super User

    >   py manage.py makemigrations
    >   py manage.py migrate
    >   py manage.py createsuperuser

6.  Create Serializers in accounts/serializers.py (create, if not available)

7.  Create accounts/authentication.py

8.  update accounts/views.py

9. update accounts/urls.py and university/urls.py

10. update accounts/admin.py

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

#   Setup Frontend 
    Now further, "The frontend of this project is developed with Next.js, initialized via yarn create next-app frontend. 
    -   The project configuration includes ESLint and Tailwind CSS, employs the src/ directory structure,
        and leverages the App Router. TypeScript, Turbopack for next dev, and custom import aliases were not selected. 
    -   Axios facilitates API communication
    -   Zustand manages application state, 
    -   react-hot-toast and react-hook-form are integrated to improve the application's user interface and 
        form handling."

1.  Install NextJS and Dependancies

    >   yarn create next-app frontend
    >   cd frontend 
    >   yarn add axios zustand react-hot-toast react-hook-form
    >   yarn add react-select                       # for the searchable dropdown

2.  Create .env.local file in next root and update with
    NEXT_PUBLIC_API_URL=http://localhost:8000

3.  Create src/lib/authApi.js and update 

-----------------------------------------------------------------------------------
# PostGRE SQL Implemantation 

1.  Django dependancy 'psycopg2-binary' for PosrGRE SQL has already installed 

2.  Create Database and user in PostGRE SQL

    -   Open PSQL command window and login as admin user 
            admin user name - Username [postgres]:
            Password    - abc@123
    -    Create a Database
            postgres=# CREATE DATABASE JCBUST_db;
    -   Create a User
            postgres=# CREATE USER manish WITH PASSWORD 'abc@123';
    -   Grant Privileges
            postgres=# GRANT ALL PRIVILEGES ON DATABASE JCBUST_db TO manish;
    -   Connect with your database
            postgres=# \c jcbust_db
    -   Create SCHEMA
            jcbust_db=# GRANT CREATE ON SCHEMA public TO manish;
            jcbust_db=# GRANT USAGE ON SCHEMA public TO manish;
    -   Exit form Database 
            jcbust_db=# \q

3.  Configure Django's settings.py:

        DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'jcbust_db',
            'USER': 'manish',
            'PASSWORD': 'abc@123',
            'HOST': 'localhost',  # Or your PostgreSQL server's address
            'PORT': '5432',  # Default PostgreSQL port
            }
        }
4.  Make and Apply Migrations and create superuser
    >   py manage.py makemigrations
    >   py manage.py migrate
    >   py manage.py createsuperuser
    >   py manage.py runserver
----------------------------------------------------------------------------

#   Configure GIT

1.  Delete existing .git brach from frontend/NextJS
    >   git rm --cached -r . #remove everything from the index
    >   git reset --hard #restores the working tree

2.  Create requirment file for Django in Django root
    >   pip freeze > requirements.txt

3.  Create .gitignore file in project root

    >   echo > .gitignore

4.  