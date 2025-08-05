import { Model } from "@nozbe/watermelondb";
import {
  field,
  text,
} from "@nozbe/watermelondb/decorators";

export class Food extends Model {
  static table = "foods";

  @text("name") name!: string;
  @text("brand") brand?: string;
  @field("calories") calories!: number;
  @field("protein_g") protein_g!: number;
  @field("carbs_g") carbs_g!: number;
  @field("fat_g") fat_g!: number;
  @field("fiber_g") fiber_g!: number;
  @field("serving_size") servingSize!: number;
  @text("serving_unit") servingUnit!: string;

  // We can add the advanced calculation methods later
}
