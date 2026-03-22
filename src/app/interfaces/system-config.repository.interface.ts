import { Signal } from "@angular/core";
import { ConfigField, ConfigGroup, FieldOption, SystemConfigEntity } from "../model/system-config-entity.model";
import { IInitializable } from "./initializable.interface";

export interface ISystemConfigRepository extends IInitializable {
  exists(): Promise<boolean>;
  get(): Signal<SystemConfigEntity>;

  create(config: SystemConfigEntity): Promise<boolean>;
  update(config: SystemConfigEntity): Promise<boolean>;

  getGroup(keyGroup: string): ConfigGroup | undefined;
  getField(keyGroup: string, keyConfigField: string): ConfigField | undefined;

  updateFieldValue(fieldKey: string, value: FieldOption): Promise<boolean>;
  resetToDefaults(): Promise<boolean>;
}
