import { PortfolioAsset } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, formatNumber } from "@/lib/utils";
import { COIN_COLORS } from "@/lib/constants";

interface AssetsTableProps {
  assets: PortfolioAsset[];
}

export function AssetsTable({ assets }: AssetsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Value</TableHead>
          <TableHead>Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              No assets found
            </TableCell>
          </TableRow>
        ) : (
          assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>{asset.id}</TableCell>
              <TableCell>{asset.userId}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: COIN_COLORS[asset.symbol as keyof typeof COIN_COLORS] || COIN_COLORS.DEFAULT
                    }}
                  />
                  <span className="text-sm">{asset.symbol}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(asset.amount)}
              </TableCell>
              <TableCell className="text-right">
                {/* Placeholder for value - we'll need to fetch current price from API */}
                {formatPrice(asset.amount * 0)}
              </TableCell>
              <TableCell>
                {new Date(asset.updatedAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}