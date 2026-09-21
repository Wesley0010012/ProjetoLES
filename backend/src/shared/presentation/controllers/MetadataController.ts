import { ResidenceTypeEnum } from 'src/customers/domain/enums/ResidenceTypeEnum';
import { StreetTypeEnum } from 'src/customers/domain/enums/StreetTypeEnum';
import { Controller, Get } from '@nestjs/common';
import { GenderEnum } from '../../domain/enums/GenderEnum';
import { PhoneTypeEnum } from '../../domain/enums/PhoneTypeEnum';

const genderLabels: Record<GenderEnum, string> = {
  [GenderEnum.MAN]: 'Homem',
  [GenderEnum.WOMAN]: 'Mulher',
  [GenderEnum.NON_BINARY]: 'Não binário',
  [GenderEnum.SELF_DESCRIBED]: 'Autodescrito',
  [GenderEnum.NOT_INFORMED]: 'Prefiro não informar',
};
const phoneLabels: Record<PhoneTypeEnum, string> = {
  [PhoneTypeEnum.MOBILE]: 'Celular',
  [PhoneTypeEnum.HOME]: 'Residencial',
  [PhoneTypeEnum.WORK]: 'Trabalho',
  [PhoneTypeEnum.COMMERCIAL]: 'Comercial',
  [PhoneTypeEnum.WHATSAPP]: 'WhatsApp',
  [PhoneTypeEnum.FAX]: 'Fax',
  [PhoneTypeEnum.OTHER]: 'Outro',
};

@Controller('metadata')
export class MetadataController {
  @Get('customer-options')
  public customerOptions() {
    return {
      residenceTypes: Object.values(ResidenceTypeEnum).map((value) => ({ value, label: value })),
      streetTypes: Object.values(StreetTypeEnum).map((value) => ({ value, label: value })),
      genders: Object.values(GenderEnum).map((value) => ({
        value,
        label: genderLabels[value],
      })),
      phoneTypes: Object.values(PhoneTypeEnum).map((value) => ({
        value,
        label: phoneLabels[value],
      })),
    };
  }
}
