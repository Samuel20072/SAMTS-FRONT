import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Try to get the token from localStorage
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token');
  }

  // Clone the request to add the authorization header
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Pass on the cloned request instead of the original request
  return next(authReq);
};
