import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface OnyxStyleTableProps {
  operations: any[];
  onOperationsChange: (operations: any[]) => void;
  accountTypes: any[];
  accountSubtypes: any[];
  chartAccounts: any[];
  currency: string;
  getAccountSubtypes: (entityId: string) => any[];
  currentEntityId: string;
}

export function OnyxStyleTable({
  operations,
  onOperationsChange,
  accountTypes,
  accountSubtypes: _accountSubtypes,
  chartAccounts,
  currency,
  getAccountSubtypes,
  currentEntityId
}: OnyxStyleTableProps) {
  const [rows, setRows] = useState<any[]>(
    operations.length > 0 
      ? operations 
      : Array(15).fill(null).map((_, i) => ({
          id: `empty-${i}`,
          accountType: "",
          accountSubtype: "",
          chartAccount: "",
          analyticalAccount: "",
          amount: "",
          description: "",
          isEmpty: true
        }))
  );

  const handleCellChange = (rowIndex: number, field: string, value: any) => {
    const newRows = [...rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [field]: value,
      isEmpty: false,
      id: newRows[rowIndex].isEmpty ? `op-${Date.now()}-${rowIndex}` : newRows[rowIndex].id
    };
    
    setRows(newRows);
    
    // Update parent with non-empty rows
    const validOperations = newRows.filter(row => 
      !row.isEmpty && row.accountType && row.amount && parseFloat(row.amount) > 0
    );
    onOperationsChange(validOperations);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const newRows = [...rows];
    newRows[rowIndex] = {
      id: `empty-${Date.now()}-${rowIndex}`,
      accountType: "",
      accountSubtype: "",
      chartAccount: "",
      analyticalAccount: "",
      amount: "",
      description: "",
      isEmpty: true
    };
    setRows(newRows);
    
    const validOperations = newRows.filter(row => 
      !row.isEmpty && row.accountType && row.amount && parseFloat(row.amount) > 0
    );
    onOperationsChange(validOperations);
  };

  const totalAmount = rows
    .filter(row => !row.isEmpty && row.amount)
    .reduce((sum, row) => sum + parseFloat(row.amount || "0"), 0);

  return (
    <div className="space-y-0">
      {/* Big Table - Onyx Pro Style */}
      <div className="border-2 border-gray-400 overflow-hidden bg-white shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 hover:from-blue-100 hover:via-blue-50 hover:to-blue-100 border-b-2 border-gray-400">
              <TableHead className="text-center text-sm font-bold py-3 px-2 border-r-2 border-gray-400 w-[5%]">#</TableHead>
              <TableHead className="text-right text-sm font-bold py-3 px-3 border-r-2 border-gray-400 w-[12%]">نوع الحساب</TableHead>
              <TableHead className="text-right text-sm font-bold py-3 px-3 border-r-2 border-gray-400 w-[12%]">النوع الفرعي</TableHead>
              <TableHead className="text-right text-sm font-bold py-3 px-3 border-r-2 border-gray-400 w-[18%]">الحساب</TableHead>
              <TableHead className="text-right text-sm font-bold py-3 px-3 border-r-2 border-gray-400 w-[15%]">الحساب التحليلي</TableHead>
              <TableHead className="text-right text-sm font-bold py-3 px-3 border-r-2 border-gray-400 w-[10%] bg-yellow-100">المبلغ</TableHead>
              <TableHead className="text-right text-sm font-bold py-3 px-3 border-r-2 border-gray-400 w-[23%]">البيان</TableHead>
              <TableHead className="text-center text-sm font-bold py-3 px-2 w-[5%]">حذف</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => {
              const _accountType = accountTypes.find(t => t.id === row.accountType);
              const _accountSubtype = getAccountSubtypes(currentEntityId).find(s => s.value === row.accountSubtype);
              const _chartAccount = chartAccounts.find(acc => acc.id === row.chartAccount);
              const _analyticalAccount = row.analyticalAccount 
                ? chartAccounts.find(acc => acc.id === row.analyticalAccount)
                : null;

              return (
                <TableRow 
                  key={row.id} 
                  className={`hover:bg-blue-50 border-b border-gray-300 ${row.isEmpty ? 'bg-white' : 'bg-green-50/30'}`}
                >
                  {/* Row Number */}
                  <TableCell className="text-center text-xs py-2 px-2 border-r-2 border-gray-300 font-medium text-gray-600">
                    {index + 1}
                  </TableCell>

                  {/* Account Type */}
                  <TableCell className="py-2 px-2 border-r-2 border-gray-300">
                    <Select 
                      value={row.accountType}
                      onValueChange={(v) => {
                        handleCellChange(index, "accountType", v);
                        handleCellChange(index, "accountSubtype", "");
                        handleCellChange(index, "chartAccount", "");
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs border-0 shadow-none focus:ring-0">
                        <SelectValue placeholder="اختر..." />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Account Subtype */}
                  <TableCell className="py-2 px-2 border-r-2 border-gray-300">
                    {row.accountType && (
                      <Select 
                        value={row.accountSubtype}
                        onValueChange={(v) => {
                          handleCellChange(index, "accountSubtype", v);
                          handleCellChange(index, "chartAccount", "");
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs border-0 shadow-none focus:ring-0">
                          <SelectValue placeholder="اختر..." />
                        </SelectTrigger>
                        <SelectContent>
                          {getAccountSubtypes(currentEntityId)
                            .filter(s => s.parentType === row.accountType)
                            .map(subtype => (
                              <SelectItem key={subtype.id} value={subtype.value}>{subtype.label}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>

                  {/* Chart Account */}
                  <TableCell className="py-2 px-2 border-r-2 border-gray-300">
                    {row.accountSubtype && (
                      <Select 
                        value={row.chartAccount}
                        onValueChange={(v) => handleCellChange(index, "chartAccount", v)}
                      >
                        <SelectTrigger className="h-8 text-xs border-0 shadow-none focus:ring-0">
                          <SelectValue placeholder="اختر..." />
                        </SelectTrigger>
                        <SelectContent>
                          {chartAccounts
                            .filter(acc => acc.accountSubtype === row.accountSubtype)
                            .map(acc => (
                              <SelectItem key={acc.id} value={acc.id}>
                                {acc.id} - {acc.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>

                  {/* Analytical Account */}
                  <TableCell className="py-2 px-2 border-r-2 border-gray-300">
                    {row.chartAccount && (
                      <Select 
                        value={row.analyticalAccount}
                        onValueChange={(v) => handleCellChange(index, "analyticalAccount", v)}
                      >
                        <SelectTrigger className="h-8 text-xs border-0 shadow-none focus:ring-0">
                          <SelectValue placeholder="اختياري" />
                        </SelectTrigger>
                        <SelectContent>
                          {chartAccounts
                            .filter(acc => acc.parentId === row.chartAccount)
                            .map(acc => (
                              <SelectItem key={acc.id} value={acc.id}>
                                {acc.id} - {acc.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="py-2 px-2 border-r-2 border-gray-300 bg-yellow-50">
                    <Input
                      type="number"
                      value={row.amount}
                      onChange={(e) => handleCellChange(index, "amount", e.target.value)}
                      className="h-8 text-xs text-right font-bold border-0 shadow-none focus:ring-0 bg-transparent"
                      placeholder="0.00"
                    />
                  </TableCell>

                  {/* Description */}
                  <TableCell className="py-2 px-2 border-r-2 border-gray-300">
                    <Input
                      type="text"
                      value={row.description}
                      onChange={(e) => handleCellChange(index, "description", e.target.value)}
                      className="h-8 text-xs border-0 shadow-none focus:ring-0 bg-transparent"
                      placeholder="البيان..."
                    />
                  </TableCell>

                  {/* Delete */}
                  <TableCell className="py-2 px-2 text-center">
                    {!row.isEmpty && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                        onClick={() => handleDeleteRow(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Total Row - Onyx Pro Style */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-700 to-blue-800 border-2 border-blue-900 shadow-xl">
        <span className="text-lg font-bold text-white">المبلغ الإجمالي:</span>
        <span className="text-2xl font-bold text-yellow-300">
          {totalAmount.toLocaleString()} {currency}
        </span>
      </div>
    </div>
  );
}
