import { Transaction } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Coins } from "lucide-react";

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              No transactions found
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{tx.id}</TableCell>
              <TableCell>{tx.userId}</TableCell>
              <TableCell>
                {tx.type === "buy" ? (
                  <Badge variant="outline" className="bg-green-900/20 text-green-500 border-0">
                    <ArrowDown className="h-3 w-3 mr-1" /> Buy
                  </Badge>
                ) : tx.type === "sell" ? (
                  <Badge variant="outline" className="bg-red-900/20 text-red-500 border-0">
                    <ArrowUp className="h-3 w-3 mr-1" /> Sell
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-blue-900/20 text-blue-500 border-0">
                    <Coins className="h-3 w-3 mr-1" /> Mining
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(tx.timestamp)}</TableCell>
              <TableCell>{tx.symbol}</TableCell>
              <TableCell>{tx.amount.toFixed(6)}</TableCell>
              <TableCell className="text-right">{formatPrice(tx.amount * tx.price)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}