import { createEntity, createFact, createInsight } from '@/domains/knowledge/actions';
import { listEntities } from '@/domains/knowledge/queries';
import type { Report } from '@/domains/write/types';

import { extractEntitiesFromText } from './extraction';
import { extractFactsFromText } from './fact-parser';
import { extractInsightsFromText } from './insight-extractor';

interface PipelineSummary {
  entitiesCreated: number;
  factsCreated: number;
  insightsCreated: number;
}

function buildReportFullText(report: Report): string {
  const lines: string[] = [report.title];

  for (const section of report.sections) {
    lines.push(section.name);
    lines.push(section.content);
  }

  return lines.join('\n');
}

async function runKnowledgeExtractionPipeline(report: Report): Promise<PipelineSummary> {
  const fullText = buildReportFullText(report);
  const summary: PipelineSummary = {
    entitiesCreated: 0,
    factsCreated: 0,
    insightsCreated: 0,
  };

  const existingEntities = await listEntities(report.workspaceId);
  const entityIdsByName = new Map(existingEntities.map((entity) => [entity.name, entity.id]));

  const extractedEntities = extractEntitiesFromText(fullText);

  for (const extracted of extractedEntities) {
    if (entityIdsByName.has(extracted.name)) {
      continue;
    }

    const entityId = await createEntity({
      aliases: extracted.aliases,
      name: extracted.name,
      type: extracted.type,
      workspaceId: report.workspaceId,
    });
    entityIdsByName.set(extracted.name, entityId);
    summary.entitiesCreated += 1;
  }

  const fallbackEntityId = Array.from(entityIdsByName.values())[0];

  if (fallbackEntityId) {
    const extractedFacts = extractFactsFromText(fullText);

    for (const fact of extractedFacts) {
      await createFact({
        category: fact.category,
        content: fact.content,
        entityId: fallbackEntityId,
        numericValue: fact.numericValue,
        periodLabel: fact.periodLabel,
        sourceReportId: report.id,
        unit: fact.unit,
        workspaceId: report.workspaceId,
      });
      summary.factsCreated += 1;
    }
  }

  const extractedInsights = extractInsightsFromText(fullText);

  for (const insight of extractedInsights) {
    await createInsight({
      category: insight.category,
      confidence: insight.confidence,
      content: insight.content,
      sourceReportId: report.id,
      workspaceId: report.workspaceId,
    });
    summary.insightsCreated += 1;
  }

  return summary;
}

export { runKnowledgeExtractionPipeline };
export type { PipelineSummary };
