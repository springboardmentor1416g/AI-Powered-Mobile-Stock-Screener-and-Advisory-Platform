#### **CI/CD \& Environment Provisioning Documentation**

##### **1. Overview**



This document explains how the project’s CI/CD pipelines and Dev/Staging/Prod environments are structured for the AI-Powered Mobile Stock Screener system.



##### **2. Environments**



|   **Environment**   |   **Purpose**                           |   **Deployment Method**     |

| --------------- | ----------------------------------- | ----------------------- |

|   **Dev**           | Local dev \& rapid iteration         | Manual / Dev CI         |

|   **Staging**       | CI-driven test builds \& integration | Auto via GitHub Actions |

|   **Prod**          | Hardened stable deployment          | Manual approval via CI  |



##### **3. Cloud Components**



###### **Per environment resources:**



* PostgreSQL database
* S3 / Blob Storage
* Backend Docker container deployment
* Secrets stored in GitHub / Vault

##### 

##### **4. CI/CD Pipelines**

###### 

###### **Backend Pipeline**

* Lint → Test → Build → Dockerize → Push image → Deploy



###### **Frontend Pipeline**

* Lint → Test → Build → Generate mobile artifacts → Upload artifacts



##### **5. Secrets**



Use **GitHub Actions → Settings → Secrets and Variables → Actions:**



**Required secrets:**



DB\_HOST\_DEV

DB\_HOST\_STAGING

DB\_HOST\_PROD

JWT\_SECRET

API\_KEYS\_MARKETDATA

DOCKERHUB\_TOKEN / GHCR\_TOKEN



##### **6. Deployment Flow**



1. Developer pushes → CI runs
2. If backend succeeds → Docker image published
3. Staging deploy job applies the image
4. Prod deployment requires manual approval





