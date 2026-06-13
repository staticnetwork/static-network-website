import { askLocalSage } from './mockSageProvider'
import { askOpenAISage } from './openAISageProvider'

export function askSage(input, options = {}) {
  return options.provider === 'openai' ? askOpenAISage(input, options.confirmPaid) : askLocalSage(input)
}

