"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  useEffect(() => {
    async function fetchCards() {
      setLoading(true);
      try {
        const response = await fetch(`/api/cards?page=${page}&limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cards');
        }
        const data = await response.json();
        setCards(data.cards);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [page, limit]);

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  if (loading && cards.length === 0) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">One Piece TCG Cards</h1>
        <Button onClick={toggleViewMode}>
          {viewMode === "grid" ? "Switch to List View" : "Switch to Grid View"}
        </Button>
      </div>
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-sm truncate">{card.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex justify-center">
                {card.img_full_url ? (
                  <div className="relative h-48 w-full">
                    <Image 
                      src={card.img_full_url} 
                      alt={card.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 text-xs">
                <div>
                  <p>Card ID: {card.id}</p>
                  {card.rarity && <p>Rarity: {card.rarity}</p>}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rarity</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Power</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>{card.id}</TableCell>
                  <TableCell>{card.name}</TableCell>
                  <TableCell>{card.card_type}</TableCell>
                  <TableCell>{card.rarity}</TableCell>
                  <TableCell>{card.color}</TableCell>
                  <TableCell>{card.cost}</TableCell>
                  <TableCell>{card.power}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {cards.length === 0 && !loading && (
        <div className="text-center py-10">
          <p>No cards found.</p>
        </div>
      )}

      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={handlePrevPage} disabled={page === 0} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>Page {page + 1}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={handleNextPage} disabled={cards.length < limit} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}