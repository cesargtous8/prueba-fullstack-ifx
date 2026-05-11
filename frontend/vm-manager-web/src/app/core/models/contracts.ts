export interface IApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface IApiResponse<T> {
  data: T;
  message?: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Cliente';
}

export interface IVM {
  id: string;
  name: string;
  cores: number;
  ramGb: number;
  diskGb: number;
  status: 'Activa' | 'Detenida';
}