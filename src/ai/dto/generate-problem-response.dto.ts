export class BoilerplateCodeDto {
  java?: string;
  python?: string;
  cpp?: string;
  typescript?: string;
}

export class GenerateProblemResponseDto {
  title!: string;
  description!: string;
  difficulty!: string;
  tags!: string[];
  group!: string;
  boilerplateCode!: BoilerplateCodeDto;
}
