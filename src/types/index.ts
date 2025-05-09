export interface Token {
  refresh: string;
  access: string;
}

export interface Tiragem {
  id: number;
  isbn: string;
  livro: number;
  disponivel: boolean;
}

export interface LivroDadosResponse {
  id: number;
  url: string;
  titulo: string;
  descricao: string;
  editora: string;
  autor: string;
  ano_publicacao: number;
  total_exemplares: number;
  tiragens: Tiragem[];
}
