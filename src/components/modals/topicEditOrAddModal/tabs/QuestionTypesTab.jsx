"use client"

import React from "react"
import BilingualInput from "../ui/BilingualInput"
import { Button } from "../../../../../components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"

const QuestionTypesTab = ({ questionType, questionTypeIndex, handleUpdate, removeQuestionType }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-foreground">Question Type {questionTypeIndex + 1}</h3>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => removeQuestionType(questionTypeIndex)}
          aria-label={`Remove Question Type ${questionTypeIndex + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <BilingualInput
        label="Name"
        fieldName={`questionTypes[${questionTypeIndex}].name`}
        englishValue={questionType.name?.en || ""}
        banglaValue={questionType.name?.bn || ""}
        onUpdate={handleUpdate}
      />

      <BilingualInput
        label="Description"
        fieldName={`questionTypes[${questionTypeIndex}].description`}
        englishValue={questionType.description?.en || ""}
        banglaValue={questionType.description?.bn || ""}
        onUpdate={handleUpdate}
        isTextarea
      />
    </div>
  )
}

export default QuestionTypesTab
