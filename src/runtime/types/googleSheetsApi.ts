export type GoogleSheetsApiValues = string[][]

export interface GoogleSheetsApiValuesResponse {
  range: string
  majorDimension: string
  values: GoogleSheetsApiValues
}

export type GoogleSheetsApiSheet = {
  properties: {
    sheetId: string
    title: string
    index: number
    sheetType: string
    gridProperties: {
      rowCount: number
      columnCount: number
    }
  }
}

export interface GoogleSheetsApiSheetResponse {
  spreadsheetId: string
  properties: {
    title: string
    locale: string
    autoRecalc: string
    timeZone: string
    defaultFormat: {
      backgroundColor: {
        red: number
        green: number
        blue: number
      }
      padding: {
        top: number
        right: number
        bottom: number
        left: number
      }
      verticalAlignment: string
      wrapStrategy: string
      textFormat: {
        foregroundColorStyle: {
          rgbColor: {
            red: number
            green: number
            blue: number
          }
        }
        foregroundColor: {
          red: number
          green: number
          blue: number
        }
        fontSize: number
        bold: boolean
        italic: boolean
        strikethrough: boolean
        underline: boolean
        fontFamily: string
      }
      backgroundColorStyle: {
        rgbColor: {
          red: number
          green: number
          blue: number
        }
      }
    }
  }
  sheets: GoogleSheetsApiSheet[]
  spreadsheetUrl: string
}

export interface ProductObject {
  [key: string]: string
}

export type TransformedGoogleSheetsApiResult = ProductObject[]
