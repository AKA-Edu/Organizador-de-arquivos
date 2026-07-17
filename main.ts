import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// 4. Tipagem Estrita (Contratos do TypeScript)
export type Categoria = 'Documentos' | 'Imagens' | 'Videos' | 'Musicas' | 'Compactados' | 'Outros';

export type MapeamentoExtensoes = Record<string, Categoria>;

export interface ResultadoOrganizacao {
  totalMovidos: number;
  erros: number;
}

// Mapeamento rígido de extensões para categorias
const MAPA_EXTENSOES: MapeamentoExtensoes = {
  // Documentos
  '.pdf': 'Documentos',
  '.docx': 'Documentos',
  '.txt': 'Documentos',
  '.xlsx': 'Documentos',
  '.pptx': 'Documentos',
  
  // Imagens
  '.jpg': 'Imagens',
  '.jpeg': 'Imagens',
  '.png': 'Imagens',
  '.gif': 'Imagens',
  '.svg': 'Imagens',
  
  // Vídeos
  '.mp4': 'Videos',
  '.mkv': 'Videos',
  '.avi': 'Videos',
  '.mov': 'Videos',
  
  // Músicas
  '.mp3': 'Musicas',
  '.wav': 'Musicas',
  '.flac': 'Musicas',
  
  // Compactados
  '.zip': 'Compactados',
  '.rar': 'Compactados',
  '.7z': 'Compactados',
  '.tar': 'Compactados'
};

/**
 * Retorna o caminho de destino único adicionando um sufixo numérico se houver conflito de nome.
 */
async function obterCaminhoDestinoUnico(pastaDestino: string, nomeArquivoOriginal: string): Promise<string> {
  const parsed = path.parse(nomeArquivoOriginal);
  let novoNome = nomeArquivoOriginal;
  let contador = 1;

  while (true) {
    const caminhoDestino = path.join(pastaDestino, novoNome);
    try {
      await fs.access(caminhoDestino);
      // Se fs.access não lançou erro, o arquivo já existe.
      // Modifica o nome adicionando o sufixo _X antes da extensão
      novoNome = `${parsed.name}_${contador}${parsed.ext}`;
      contador++;
    } catch {
      // Se fs.access lançou erro, significa que o caminho está livre para uso
      return caminhoDestino;
    }
  }
}

/**
 * Função principal para organizar a pasta informada.
 */
export async function organizarPasta(pastaAlvo: string): Promise<ResultadoOrganizacao> {
  const resultado: ResultadoOrganizacao = { totalMovidos: 0, erros: 0 };

  try {
    // Validar se o caminho informado realmente existe e se é uma pasta válida
    const stats = await fs.stat(pastaAlvo);
    if (!stats.isDirectory()) {
      console.error(`Erro: O caminho "${pastaAlvo}" não é um diretório válido.`);
      process.exit(1);
    }
  } catch {
    console.error(`Erro: Pasta não encontrada no caminho "${pastaAlvo}".`);
    process.exit(1);
  }

  try {
    // Ler todos os itens presentes na raiz da pasta
    const itens = await fs.readdir(pastaAlvo, { withFileTypes: true });
    
    // Filtrar a lista: Manter apenas ARQUIVOS, ignorar PASTAS
    const arquivos = itens.filter(item => item.isFile());

    for (const arquivo of arquivos) {
      const caminhoOriginal = path.join(pastaAlvo, arquivo.name);
      
      try {
        // Extrair a extensão do arquivo e colocar em minúsculas
        const ext = path.extname(arquivo.name).toLowerCase();
        
        // Descobrir a Categoria correspondente no dicionário
        const categoria: Categoria = MAPA_EXTENSOES[ext] || 'Outros';
        
        // Definir a pasta de destino para a categoria
        const pastaCategoria = path.join(pastaAlvo, categoria);

        // Criar a subpasta apenas se necessário
        await fs.mkdir(pastaCategoria, { recursive: true });

        // Resolver conflitos de nomes se houver
        const caminhoDestino = await obterCaminhoDestinoUnico(pastaCategoria, arquivo.name);

        // Mover o arquivo com segurança
        await fs.rename(caminhoOriginal, caminhoDestino);
        resultado.totalMovidos++;
      } catch (error) {
        console.error(`Falha ao mover o arquivo "${arquivo.name}":`, error);
        resultado.erros++;
      }
    }
  } catch (error) {
    console.error('Erro ao ler a pasta:', error);
    resultado.erros++;
  }

  return resultado;
}

// Execução da CLI
async function main() {
  // Capturar o caminho da pasta via argumento do terminal
  const caminhoPasta = process.argv[2];

  if (!caminhoPasta) {
    console.log('Uso: npm start -- <caminho_da_pasta>');
    process.exit(1);
  }

  const absolutePath = path.resolve(caminhoPasta);
  console.log(`Iniciando a organização da pasta: ${absolutePath}\n`);

  const resultado = await organizarPasta(absolutePath);

  console.log('----------------------------------------');
  console.log('ORGANIZAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log(`Arquivos movidos: ${resultado.totalMovidos}`);
  console.log(`Erros encontrados: ${resultado.erros}`);
  console.log('----------------------------------------');
}

// Executa se o script for executado diretamente
const isMainModule = import.meta.url.endsWith(path.basename(process.argv[1] || ''));
if (isMainModule || process.argv[1]?.includes('main.ts') || process.argv[1]?.includes('tsx')) {
  main().catch(err => {
    console.error('Erro crítico na execução:', err);
    process.exit(1);
  });
}
