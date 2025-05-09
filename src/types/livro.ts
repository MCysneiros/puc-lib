export interface LivroData {
  id: number;
  url: string;
  titulo: string;
  descricao: string;
  editora: string;
  autor: string;
  ano_publicacao: number;
  total_exemplares: number;
  tiragens: {
    id: number;
    isbn: string;
    livro: number;
    disponivel: boolean;
  }[];
}
