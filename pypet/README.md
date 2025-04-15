# 简易SSO系统使用说明文档

---

#### 目录

1. **项目概述**
2. **系统架构**
3. **主要功能**
4. **技术栈**
5. **接口文档**
   - `/api/token_obtain/`
   - `/api/token_refresh/`
   - `/api/token_verify/`
6. **使用流程**
7. **常见问题**

---

### 1. 项目概述

本项目是基于 Django 的 `djangorestframework-simplejwt` 搭建的单点登录（SSO）系统，旨在为多个应用提供统一的用户认证和授权服务。通过此 SSO 系统，用户只需登录一次，即可访问所有授权的应用程序。

### 2. 系统架构

系统架构包括以下几个部分：

- **认证服务**：处理用户的身份验证，签发和管理 JWT（JSON Web Token）。
- **授权服务**：基于 JWT 验证用户的身份并管理访问权限。
- **应用客户端**：各应用通过 SSO 系统进行用户登录验证。

### 3. 主要功能

- **用户登录**：用户通过用户名和密码进行身份验证。
- **Token 签发**：成功登录后，系统签发一个短期有效的 Access Token 和长期有效的 Refresh Token。
- **Token 刷新**：当 Access Token 过期时，用户可以使用 Refresh Token 获取新的 Access Token。
- **Token 验证**：验证客户端提供的 JWT 是否有效。

### 4. 技术栈

- **后端框架**：Django 4.x, Django REST Framework
- **认证**：djangorestframework-simplejwt
- **数据库**：PostgreSQL 

### 5. 接口文档

#### 1. `/api/token_obtain/`

   **描述**: 用户登录，获取 Access Token 和 Refresh Token。

   - **方法**: `POST`

   - **请求体**:

     ```json
     {
       "username": "your_username",
       "password": "your_password"
     }
     ```

   - **响应**:

     ```json
     {
       "access": "your_access_token",
       "refresh": "your_refresh_token"
     }
     ```

#### 2. `/api/token_refresh/`

   **描述**: 使用 Refresh Token 获取新的 Access Token。

   - **方法**: `POST`

   - **请求体**:

     ```json
     {
       "refresh": "your_refresh_token"
     }
     ```

   - **响应**:

     ```json
     {
       "access": "new_access_token"
     }
     ```

#### 3. `/api/token_verify/`

   **描述**: 验证 Access Token 是否有效。

   - **方法**: `POST`

   - **请求体**:

     ```json
     {
       "token": "your_access_token"
     }
     ```

   - **响应**:

     ```json
     {}
     ```

   - **错误响应**:

     ```json
     {
       "detail": "Token is invalid or expired"
     }
     ```





### 6. 使用流程

本节将详细介绍如何在实际应用中使用简易 SSO 系统。这包括用户登录、资源访问、令牌刷新和验证的具体操作，以及各子系统需要执行的任务。

---

#### 1. **用户登录**

- **触发条件**: 当用户首次访问某个受保护的资源或应用程序时，客户端（应用）检测到用户尚未登录或当前的 Access Token 无效。

- **操作步骤**:

  1. 客户端将用户重定向到 SSO 认证服务的登录页面，用户输入用户名和密码。

  2. 登录页面的表单会将用户输入的信息发送到 `/api/token_obtain/` 端点，通常以 `POST` 请求方式，内容包括：

     ```json
     {
       "username": "your_username",
       "password": "your_password"
     }
     ```

  3. 认证服务验证用户凭证。如果成功，将返回一个 JSON 对象，包含 `access` 和 `refresh` 令牌：

     ```json
     {
       "access": "your_access_token",
       "refresh": "your_refresh_token"
     }
     ```

  4. 客户端从响应中提取令牌，并将 `access` 令牌暂存到客户端存储中（例如浏览器的 `localStorage` 或 `sessionStorage`）。

- **重定向**:

  - 用户登录成功后，客户端通常会自动将用户重定向回最初请求的受保护资源页面。

---

#### 2. **访问受保护资源**

- **触发条件**: 用户在客户端上尝试访问受保护的资源或 API。

- **操作步骤**:

  1. 客户端从存储中读取 `access` 令牌，并将其附加在 HTTP 请求的头部。头部格式如下：

     ```http
     Authorization: Bearer your_access_token
     ```

  2. 服务器接收到请求后，会通过 SSO 系统验证 `access` 令牌的有效性。如果令牌有效，服务器会允许访问受保护的资源。

  3. 如果令牌无效或过期，服务器会返回 `401 Unauthorized` 错误。在这种情况下，客户端应该根据业务逻辑处理，通常会触发令牌刷新或重新登录流程。

- **示例请求**:

  ```http
  GET /api/protected_resource/
  Authorization: Bearer your_access_token
  ```

---

#### 3. **Token 刷新**

- **触发条件**: 当 `access` 令牌过期时，客户端尝试刷新令牌以继续访问资源。

- **操作步骤**:

  1. 客户端从存储中读取 `refresh` 令牌，并向 `/api/token_refresh/` 端点发送 `POST` 请求，内容如下：

     ```json
     {
       "refresh": "your_refresh_token"
     }
     ```

  2. SSO 系统验证 `refresh` 令牌的有效性。如果验证通过，系统会返回一个新的 `access` 令牌：

     ```json
     {
       "access": "new_access_token"
     }
     ```

  3. 客户端收到新的 `access` 令牌后，将其替换原有的令牌，并继续发起受保护资源的请求。

- **重定向**:

  - 如果 `refresh` 令牌也过期或无效，客户端应将用户重定向到登录页面，以重新获取有效的认证。

---

#### 4. **Token 验证**

- **触发条件**: 客户端在某些情况下可能需要主动验证当前的 `access` 令牌（例如，定时验证令牌的有效性）。

- **操作步骤**:

  1. 客户端向 `/api/token_verify/` 端点发送 `POST` 请求，内容包括要验证的 `access` 令牌：

     ```json
     {
       "token": "your_access_token"
     }
     ```

  2. SSO 系统检查令牌的有效性。如果令牌有效，系统会返回空的 JSON 响应 `{}`，表示令牌有效。

  3. 如果令牌无效或已过期，系统将返回 `401 Unauthorized` 错误，客户端应根据业务逻辑进行相应处理（如重新获取令牌或引导用户登录）。

- **使用场景**:

  - 一些客户端可能在用户进行重要操作前，先验证当前令牌是否有效，以确保操作的安全性。

---

### 子系统职责总结

- **SSO 认证服务**:
  - 负责用户的身份认证和令牌的签发、刷新与验证。
  - 管理所有用户登录逻辑及授权令牌的生命周期。

- **客户端应用（子系统）**:
  - 负责用户的登录重定向及令牌的存储和管理。
  - 在请求受保护资源时，自动将 `access` 令牌附加到请求头中。
  - 检测并处理 `access` 令牌的过期状态，并根据需要触发 `refresh` 令牌请求或重定向用户登录。

---

通过此流程，简易 SSO 系统能够在保证安全性的前提下，提供便捷的统一身份认证体验。各子系统通过正确的令牌管理和验证流程，确保了整个系统的安全和高效运作。



### 7. 常见问题

#### 7.1. **Token 过期后怎么办？**

   1.重新登录获取新的Access Token   **(建议)**

   2.使用 Refresh Token 向 `/api/token_refresh/` 发送请求，获取新的 Access Token。

#### 7.2. **如何保护 Refresh Token？**

   Refresh Token 通常应保存在客户端的安全存储中，并且仅在需要刷新 Access Token 时才使用。