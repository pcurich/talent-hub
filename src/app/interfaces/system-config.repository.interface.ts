import { Signal } from "@angular/core";
import { ConfigField, ConfigGroup, SystemConfig } from "../model/system-config.model";
import { IInitializable } from "./initializable.interface";

export interface ISystemConfigRepository extends IInitializable {
  exists(): Promise<boolean>;
  get(): Signal<SystemConfig>;

  create(config: SystemConfig): Promise<boolean>;
  update(config: SystemConfig): Promise<boolean>;

  getGroup(keyGroup: string): ConfigGroup | undefined;
  getField(keyGroup: string, keyConfigField: string): ConfigField | undefined;

  updateFieldValue(fieldKey: string, value: string | number | boolean | string[] | null): Promise<boolean>;
  resetToDefaults(): Promise<boolean>;
}
