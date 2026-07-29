type CreateGetLogo = typeof import('bimi-url')

type Options = Parameters<CreateGetLogo>[0]

declare function rules(options?: Options): import('metascraper').Rules;

declare namespace rules {
  const createGetLogo: CreateGetLogo;
  const resolveLogoUrl: CreateGetLogo['resolveLogoUrl'];
  const toLogoUrl: CreateGetLogo['toLogoUrl'];
}

export = rules;
