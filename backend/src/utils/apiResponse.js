'use strict';

/**
 * Standardised API response helpers.
 */
class ApiResponse {
  /**
   * Send a successful response.
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send an error response.
   */
  static error(res, message = 'An error occurred', statusCode = 400, errors = null) {
    const payload = { success: false, message };
    if (errors) payload.errors = errors;
    return res.status(statusCode).json(payload);
  }

  /**
   * Send a paginated response.
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success:    true,
      message,
      data,
      pagination: {
        total:       pagination.totalDocs ?? pagination.total,
        page:        pagination.page,
        limit:       pagination.limit,
        totalPages:  pagination.totalPages,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
      },
    });
  }

  /**
   * Send a 201 Created response.
   */
  static created(res, data = null, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }
}

module.exports = ApiResponse;
