/**
 * ApiService
 * A wrapper class to interact with the Pet Adopt REST API (https://petadopt.onrender.com).
 */
class ApiService {
  /**
   * Initializes the API service with a base URL.
   * @param {string} baseUrl - The base URL of the API.
   */
  constructor(baseUrl = "https://petadopt.onrender.com") {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  /**
   * Sets the authorization token for subsequent requests.
   * @param {string} token - The authorization token/JWT.
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Gets the authorization headers if a token is set.
   * Checks if the token already has the 'Bearer ' prefix; if not, appends it.
   * @returns {object} Headers object.
   */
  getAuthHeaders() {
    if (!this.token) {
      return {};
    }
    const formattedToken = this.token.startsWith("Bearer ")
      ? this.token
      : `Bearer ${this.token}`;
    return { Authorization: formattedToken };
  }

  /**
   * Helper method to perform fetch requests with automatic JSON parsing and error handling.
   * @private
   */
  async _request(path, options = {}) {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : "/" + path}`;

    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    // Prepare fetch options
    const fetchOptions = {
      ...options,
      headers,
    };

    // If body is provided and is not a FormData instance, handle JSON serialization
    if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      if (typeof fetchOptions.body === "object") {
        fetchOptions.body = JSON.stringify(fetchOptions.body);
      }
    }

    try {
      const response = await fetch(url, fetchOptions);

      let data = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error = new Error(
          (data && (data.message || data.error)) ||
            `Request failed with status ${response.status}`,
        );
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Enhance error if it doesn't already have status properties
      if (!err.status) {
        // e.g. Network error
        err.message = `Network error: ${err.message}`;
      }
      throw err;
    }
  }

  /* ========================================================================
   * API ENDPOINTS
   * ======================================================================== */

  // POST /user/register
  // Register user (e.g. name, email, password, confirmpassword, phone)
  async register(userData, options = {}) {
    const payload = { ...userData };
    // Map confirmPassword to confirmpassword (lowercase) for backend compatibility
    if (payload.confirmPassword !== undefined) {
      payload.confirmpassword = payload.confirmPassword;
      delete payload.confirmPassword;
    }
    return this._request("/user/register", {
      method: "POST",
      body: payload,
      ...options,
    });
  }

  // POST /user/login
  // Login user (e.g. email, password)
  async login(credentials, options = {}) {
    return this._request("/user/login", {
      method: "POST",
      body: credentials,
      ...options,
    });
  }

  // GET /user/checkuser
  // Checks current authenticated user's session
  async checkUser(options = {}) {
    return this._request("/user/checkuser", {
      method: "GET",
      ...options,
    });
  }

  // GET /pet/pets
  // Get list of all pets
  async getPets(options = {}) {
    return this._request("/pet/pets", {
      method: "GET",
      ...options,
    });
  }

  // GET /pet/{id}
  // Get a single pet details by ID
  async getPetById(id, options = {}) {
    return this._request(`/pet/${id}`, {
      method: "GET",
      ...options,
    });
  }

  // POST /pet/create
  // Create a new pet (usually expects FormData if uploading images)
  async createPet(petData, options = {}) {
    return this._request("/pet/create", {
      method: "POST",
      body: petData,
      ...options,
    });
  }

  // PATCH /pet/edit/{id}
  // Edit a pet profile/details by ID (expects pet data)
  async editPet(id, petData, options = {}) {
    return this._request(`/pet/edit/${id}`, {
      method: "PATCH",
      body: petData,
      ...options,
    });
  }

  // DELETE /pet/{id}
  // Delete a pet by ID
  async deletePet(id, options = {}) {
    return this._request(`/pet/${id}`, {
      method: "DELETE",
      ...options,
    });
  }

  // PATCH /pet/{id}
  // Alternate update method for pet by ID
  async updatePetPatch(id, updateData, options = {}) {
    return this._request(`/pet/${id}`, {
      method: "PATCH",
      body: updateData,
      ...options,
    });
  }

  // PATCH /pet/verify/{id}
  // Verify action for a resource/user by ID
  async verify(id, options = {}) {
    return this._request(`/pet/verify/${id}`, {
      method: "PATCH",
      ...options,
    });
  }

  // GET /pet/category
  // Get list of all pet categories
  async getCategories(options = {}) {
    return this._request("/pet/category", {
      method: "GET",
      ...options,
    });
  }

  // GET /pet/mypets
  // Get all pets registered by the currently logged-in user
  async getMyPets(options = {}) {
    return this._request("/pet/mypets", {
      method: "GET",
      ...options,
    });
  }

  // GET /adoption/myadoptions
  // Get all adoptions requested or concluded by the currently logged-in user
  async getMyAdoptions(options = {}) {
    return this._request("/adoption/myadoptions", {
      method: "GET",
      ...options,
    });
  }

  // PATCH /adoption/schedule/{id}
  // Schedule a visit/adoption process for a pet by ID
  async scheduleAdoption(id, options = {}) {
    return this._request(`/adoption/schedule/${id}`, {
      method: "PATCH",
      ...options,
    });
  }

  // PATCH /adoption/conclude/{id}
  // Conclude the adoption process of a pet by ID
  async concludeAdoption(id, options = {}) {
    return this._request(`/adoption/conclude/${id}`, {
      method: "PATCH",
      ...options,
    });
  }

  // GET /user/users
  // Get a list of all users (admin access required usually)
  async getUsers(options = {}) {
    return this._request("/user/users", {
      method: "GET",
      ...options,
    });
  }

  // GET /adoption/adoptions
  // Get a list of all adoptions in the system (admin access required usually)
  async getAdoptions(options = {}) {
    return this._request("/adoption/adoptions", {
      method: "GET",
      ...options,
    });
  }
}

// Export class and a default singleton instance
const api = new ApiService();
export { ApiService };
export default api;
