export interface ITemplateService {
  /**
   * Get the template diagram for a specific project template type
   * @param templateType The type of template to retrieve
   * @returns The template diagram data for the specified template type
   */
  getTemplateDesign(templateType: string): Promise<Record<string, unknown>>;

  /**
   * Get all available template types
   * @returns List of all available template types and their descriptions
   */
  getAvailableTemplates(): Promise<
    Array<{ type: string; description: string }>
  >;
}
