export interface Vm {
  id: string;
  name: string;
  cores: number;
  ram: number;
  disk: number;
  os: string;
  status: 'Encendida' | 'Apagada';
  createdAt: string;
  updatedAt: string;
}

export interface VmRequest {
  name: string;
  cores: number;
  ram: number;
  disk: number;
  os: string;
  status: 'Encendida' | 'Apagada';
}