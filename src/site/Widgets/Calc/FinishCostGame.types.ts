export type FinishCostQuestionKind = "number" | "select" | "choice";

export type FinishCostQuestionOption = {
	Value: string;
	Label: string;
	Factor?: number;
	Fixed?: number;
};

export type FinishCostQuestion = {
	Key: string;
	Label: string;
	Hint?: string;
	Kind: FinishCostQuestionKind;
	Unit?: string;
	Min?: number;
	Max?: number;
	Step?: number;
	Baseline?: number;
	FactorPerUnit?: number;
	FixedPerUnit?: number;
	Options?: FinishCostQuestionOption[];
};

export type FinishCostStage = {
	Title: string;
	Accuracy: number;
	Desc: string;
	Questions: FinishCostQuestion[];
};

export type FinishCostItem = {
	Id: string;
	Title: string;
	ShortTitle: string;
	Kicker: string;
	BaseRate: number;
	Accent: string;
	Stages: FinishCostStage[];
};
