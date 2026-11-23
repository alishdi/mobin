import { ILike } from 'typeorm';

export class SearchHelper {

  static sanitizeSearchTerm(term: string | undefined): string {
    if (!term) return '';
    return term
      .trim()
      .replace(/[%_\\]/g, '') 
      .substring(0, 100); 
  }


  static buildSearchWhere<T>(fields: (keyof T)[], searchTerm: string): any[] {
    const cleanTerm = this.sanitizeSearchTerm(searchTerm);
    if (!cleanTerm || cleanTerm.length < 2) {
      return [];
    }
    const pattern = `%${cleanTerm}%`;
    return fields.map(field => ({ [field]: ILike(pattern) }));
  }
}