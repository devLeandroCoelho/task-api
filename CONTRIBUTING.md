# Contribuindo com o task-api

Obrigado por querer contribuir! 🎉 Este guia mantém o projeto organizado e o
histórico limpo.

## Ambiente

- Node.js 20+ e npm 10+
- TypeScript estrito (`npx tsc --noEmit` deve passar)
- Testes com Vitest (`npx vitest run` deve passar)

## Fluxo de contribuição

1. **Abra uma issue** descrevendo o problema ou a melhoria (ou comente em uma existente).
2. **Faça um fork** do repositório e crie uma branch descritiva a partir de `main`:
   ```bash
   git checkout -b feat/minha-melhoria
   # ou
   git checkout -b fix/meu-bug
   ```
3. **Implemente** com foco e escopo único (uma branch = uma mudança).
4. **Rode os checks antes do commit**:
   ```bash
   npm ci
   npx tsc --noEmit   # typecheck
   npx vitest run     # testes
   npm run build      # build
   ```
5. **Commit** com mensagem clara e objetiva (padrão do repo: `feat:`, `fix:`, `docs:`, `ci:`, `test:`).
6. **Abra um Pull Request** para `main` com:
   - descrição do que mudou e por quê;
   - referência à issue (`closes #NN`);
   - se aplicável, screenshot/evidência e nota de breaking change.
7. O CI roda typecheck + testes + build automaticamente. **PR só é mergeado com CI verde.**

## Convenções

- Zero commits diretos em `main`.
- Nunca commite `.env` / `.env.local` / segredos.
- Não altere `package-lock.json` fora do necessário (prefira `npm ci` no setup).
- TypeScript em modo estrito — sem `any` silencioso.

## Reportando bugs

Inclua: passos para reproduzir, comportamento esperado vs. observado, versão do
Node, e logs relevantes (remova segredos!).

## Licença

Ao contribuir, você concorda que suas contribuições ficam sob a [MIT License](LICENSE).
